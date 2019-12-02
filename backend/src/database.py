import logging
import asyncio
import re
from threading import Thread
from typing import Optional, Callable, Dict, Any, List

import janus
import mysql.connector
import mysql.connector.pooling

from backend.src.exceptions import InvalidArgumentException, ProgramClosingException, SingletonException

POOL_SIZE = 5


class SQLQueue:
    __instances = {}

    @staticmethod
    def get_instance(**database_args) -> 'SQLQueue':
        """ Static access method. """
        if str(database_args) not in SQLQueue.__instances.keys():
            SQLQueue(**database_args)
        return SQLQueue.__instances[str(database_args)]

    def __init__(self, **database_args) -> 'SQLQueue':
        """ Virtually private constructor. """
        if str(database_args) in SQLQueue.__instances.keys():
            raise SingletonException("This class is a singleton! Please use get_instance()")
        else:
            self.__database_args = database_args
            self.__immediate_connection = mysql.connector.connect(**database_args)
            self.__other_connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="other_queries",
                                                                             pool_size=POOL_SIZE,
                                                                             **database_args)
            self.__other_connections_open = 0
            self.__async_query_queue_accepting = True
            self.__async_query_queue_runner_running = True

            self.__consumers = []
            for i in range(POOL_SIZE):
                self.__consumers.append(self.__query_queue_consumer())

            self.__async_query_loop = asyncio.new_event_loop()
            self.__query_queue = janus.Queue(loop=self.__async_query_loop)
            self.__async_thread = Thread(target=SQLQueue.__start_loop, args=(self.__async_query_loop, self.__consumers))
            self.__async_thread.start()

            SQLQueue.__instances[str(database_args)] = self

    @staticmethod
    def __start_loop(loop, consumers):
        asyncio.set_event_loop(loop)
        loop.run_until_complete(asyncio.gather(*consumers))

    def select(self, query: str, parameters, fetch_all: bool = True) -> Dict[str, Any]:
        """
        This is a blocking query to run a select query immediately.
        :param query: The SELECT query to run
        :param parameters: The parameters for this query
        :param fetch_all: boolean type, defaults to `True`, specifying if fetchall() or fetchone() should be used
        :return: The data queried
        """
        if not bool(re.match('select', query, re.I)):
            raise InvalidArgumentException("Only SELECT queries can be placed here. Use execute() for other queries")

        cursor = self.__immediate_connection.cursor()
        cursor.execute(query, parameters)

        if fetch_all:
            return cursor.fetchall()

        return cursor.fetchone()

    def execute(self, query, parameters,
                callback: Optional[Callable[[List[Dict[str, Any]]], None]] = lambda *args, **kwargs: None) -> None:
        """
        Places a query in the queue
        :param query: Query to run
        :param parameters: Query Parameters
        :param callback: Optional function to run once the query is complete.
        :return: Nothing
        """
        if self.__async_query_queue_accepting:
            self.__query_queue.sync_q.put_nowait({'query': query, 'parameters': parameters, 'callback': callback})
        else:
            raise ProgramClosingException("The queue has closed")

    def execute_with_result(self, query, parameters):
        """
        Blocking call
        """
        logger = logging.getLogger(__name__)
        logging.debug(f"execute_with_result: query: {query}, parameters: {parameters}")
        cursor = self.__immediate_connection.cursor()
        logger.debug(f"Executing the query {query['query']} with parameters {query['parameters']} ")
        cursor.execute(query, parameters)
        result = cursor.fetchall()
        logger.debug(f"Result: {result}")

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

            cursor = connection.cursor()
            cursor.execute(query['query'], query['parameters'])

            result = cursor.fetchall()
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
