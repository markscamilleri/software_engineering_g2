import logging
import asyncio
import re
from threading import Thread
from typing import Optional, Callable, Dict, Any, List, Iterable

import janus
import mysql.connector
import mysql.connector.pooling

from exception import InvalidArgumentException, ProgramClosingException, SingletonException

POOL_SIZE = 5


class SQLQueue:
    __instances = {}

    @staticmethod
    def get_instance(**database_args) -> 'SQLQueue':
        logger = logging.getLogger(__name__)
        """ Static access method. """
        if str(database_args) not in SQLQueue.__instances.keys():
            logger.info("Creating a new singleton instance")
            SQLQueue(**database_args)
        return SQLQueue.__instances[str(database_args)]

    def __init__(self, **database_args) -> 'SQLQueue':
        logger = logging.getLogger(__name__)
        """ Virtually private constructor. """
        if str(database_args) in SQLQueue.__instances.keys():
            logger.error("Attempted to create another instance of a singleton class")
            raise SingletonException("This class is a singleton! Please use get_instance()")
        else:
            logger.debug("Setting database args")
            self.__database_args = database_args
            logger.debug(
                "Database args set: {} (passwords omitted)".format(
                    {k: v for k, v in self.__database_args.items() if not k == 'password'}))
            logger.debug("Creating immediate connection")
            self.__immediate_connection = mysql.connector.connect(**database_args)
            logger.debug(f"Immediate Connection opened: {self.__immediate_connection}")
            logger.debug("Creating Asynchronous connection pool")
            self.__other_connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="other_queries",
                                                                                       pool_size=POOL_SIZE,
                                                                                       **database_args)
            logger.debug(f"Connection pool created: {self.__other_connection_pool}")
            logger.debug("Setting Connections Open to 0")
            self.__other_connections_open = 0
            logger.debug(f"Connections Open = {self.__other_connections_open}")
            logger.debug("Setting accepting flag to True")
            self.__async_query_queue_accepting = True
            logger.debug(f"Accepting flag = {self.__async_query_queue_accepting}")
            logger.debug("Setting running flag to True")
            self.__async_query_queue_runner_running = True
            logger.debug(f"Running flag = {self.__async_query_queue_runner_running}")

            logger.debug("Creating the consumer coroutines")
            self.__consumers = []
            for i in range(POOL_SIZE):
                self.__consumers.append(self.__query_queue_consumer())

            logger.debug(f"Consumer coroutines created: {self.__consumers}")
            logger.debug("Creating event loop for coroutines")
            self.__async_query_loop = asyncio.new_event_loop()
            logger.debug(f"Event loop created: {self.__async_query_loop}")
            logger.debug("Creating janus Queue")
            self.__query_queue = janus.Queue(loop=self.__async_query_loop)
            logger.debug(f"Janus Queue created: {self.__query_queue}")
            logger.debug("Creating async thread")
            self.__async_thread = Thread(target=SQLQueue.__start_loop, args=(self.__async_query_loop, self.__consumers))
            logger.debug(f"Async thread created: {self.__async_thread}")
            logger.debug("Starting async thread")
            self.__async_thread.start()

            SQLQueue.__instances[str(database_args)] = self
            logger.debug("SQLQueue instance initialized and added")

    @staticmethod
    def __start_loop(loop, consumers):
        asyncio.set_event_loop(loop)
        loop.run_until_complete(asyncio.gather(*consumers))

    def select(self, query: str, parameters: Iterable = None, fetch_all: bool = True) -> Dict[str, Any]:
        """
        This is a blocking query to run a select query immediately.
        :param query: The SELECT query to run
        :param parameters: The parameters for this query
        :param fetch_all: boolean type, defaults to `True`, specifying if fetchall() or fetchone() should be used
        :return: The data queried
        """
        if not bool(re.match('select', query, re.I)):
            raise InvalidArgumentException("Only SELECT queries can be placed here. Use execute() for other queries")

        cursor = self.__immediate_connection.cursor(dictionary=True, buffered=True)
        cursor.execute(query, parameters)

        if cursor.rowcount == 0:
            return {}

        if fetch_all:
            return cursor.fetchall()

        return cursor.fetchone()

    def execute(self, query: str, parameters: Iterable = None,
                callback: Optional[Callable[[List[Dict[str, Any]]], None]] = lambda *args, **kwargs: None) -> None:
        """
        Places a query in the queue
        :param query: Query to run
        :param parameters: Query Parameters
        :param callback: Optional function to run once the query is complete.
        :return: Nothing
        """
        logger = logging.getLogger(__name__)
        if self.__async_query_queue_accepting:
            logger.debug(f"Queuing query \"{query}\" with parameters {parameters} and callback {callback}")
            self.__query_queue.sync_q.put_nowait({'query': query, 'parameters': parameters, 'callback': callback})
            logger.debug("Query is queued for execution")
        else:
            logger.error("Tried to queue a query when the queue is closed")
            logger.debug(f"Query \"{query}\" with parameters {parameters} and callback {callback}")
            raise ProgramClosingException("The queue has closed")

    def execute_with_result(self, query: str, parameters: Iterable = None):
    def blocking_execute(self):
        """
        Blocking call
        """
        logger = logging.getLogger(__name__)

        logging.debug(f"execute_with_result: query: {query}, parameters: {parameters}")
        cursor = self.__immediate_connection.cursor(dictionary=True, buffered=True)
        logger.debug(f"Executing the query {query} with parameters {parameters} ")
        cursor.execute(query, parameters)

        if cursor.rowcount == 0:
            self.__immediate_connection.commit()
            return {}

        result = cursor.fetchall()
        logger.debug(f"Result: {result}")
        self.__immediate_connection.commit()

        return result

    async def __query_queue_consumer(self):
        # Waits until there's a free connection
        logger = logging.getLogger(__name__)

        while self.__async_query_queue_runner_running:
            query = await self.__query_queue.async_q.get()
            query_hash = hash((query['query'], query['parameters'], query['callback']))
            logger.debug(
                f"{query_hash}: Executing the query {query['query']} with parameters {query['parameters']}")

            self.__other_connections_open += 1
            connection = self.__other_connection_pool.get_connection()

            cursor = connection.cursor(dictionary=True, buffered=True)
            cursor.execute(query['query'], query['parameters'])

            result = cursor.fetchall() if cursor.rowcount > 0 else None
            logger.debug(f"{query_hash}: result: {result}")
            connection.commit()
            connection.close()

            self.__other_connections_open -= 1
            logger.debug(f"{query_hash}: Connection closed. Running callback")
            query['callback'](result)

            logger.debug(f"{query_hash}: Finished processing")

    def __del__(self):
        logger = logging.getLogger(__name__)

        logger.info("Closing SQLQueue")
        logger.debug("Not accepting new queries")
        self.__async_query_queue_accepting = False
        logger.debug("Closing immediate connection")
        self.__immediate_connection.close()
        logger.info("Waiting for tasks to finish")
        self.__query_queue.sync_q.join()
        logger.debug("Terminating Consumers")
        self.__async_query_queue_runner_running = False
        logger.info("Waiting for threads to finish")
        self.__async_thread.join()
        logger.info("SQLQueue instance closed")
