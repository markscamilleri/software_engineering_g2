import logging
import asyncio
import queue
import re
from typing import Optional, Callable, Dict, Any, List

import mysql.connector as mysql
import mysql.connector.pooling
from mysql.connector import PoolError

logger = logging.getLogger()

POOL_SIZE = 5


class InvalidArgumentException(Exception):
    pass


class ProgramClosingException(Exception):
    pass


class SingletonException(Exception):
    pass


class SQLQueue:
    _instances = {}

    @staticmethod
    def get_instance(**database_args) -> 'SQLQueue':
        """ Static access method. """
        if database_args not in SQLQueue._instances:
            SQLQueue(database_args)
        return SQLQueue.__instances[database_args]

    def __init__(self, database_args) -> 'SQLQueue':
        """ Virtually private constructor. """
        if database_args not in SQLQueue.__instances:  # TODO Check this properly
            raise SingletonException("This class is a singleton! Please use get_instance()")
        else:
            self.__database_args = database_args
            self.__immediate_connection = mysql.connect(database_args)
            self.__other_connection_pool = mysql.pooling.MySQLConnectionPool(pool_name="other_queries",
                                                                             pool_size=POOL_SIZE,
                                                                             **database_args)
            self.__other_connections_open = 0
            self.__async_query_queue = asyncio.Queue()
            self.__async_query_queue_accepting = True
            self.__async_query_queue_runner_running = True

            self.__consumers = []
            for i in range(POOL_SIZE):
                self.__consumers.append(asyncio.create_task(self.__query_queue_consumer()))

            for i in range(self.__other_connection_pool.pool_size):
                self.__other_connection_pool.add_connection()

            SQLQueue.__instances[database_args] = self

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
            self.__async_query_queue.put({'query': query, 'parameters': parameters, 'callback': callback})
        else:
            raise ProgramClosingException("The queue has closed")

    def execute_with_result(self, query, parameters):
        """
        Blocking call
        """
        logging.debug(f"execute_with_result: query: {query}, parameters: {parameters}")
        cursor = self.__immediate_connection.cursor()
        logger.debug(f"Executing the query {query['query']} with parameters {query['parameters']} ")
        cursor.execute(query, parameters)
        result = cursor.fetchall()
        logger.debug(f"Result: {result}")

        return result

    async def __query_queue_consumer(self):
        # Waits until there's a free connection
        while self.__async_query_queue_runner_running:
            try:
                query = self.__async_query_queue.get()
                id = hash((query['query'], query['parameters'], query['callback']))
                logger.debug(f"{id}: Executing the query {query['query']} with parameters {query['parameters']} ")

                self.__other_connections_open += 1
                connection = self.__other_connection_pool.get_connection()

                cursor = connection.cursor()
                cursor.execute(query['query'], query['parameters'])

                result = cursor.fetchall()
                logger.debug(f"{id}: result: {result}")
                query['callback'](result)
                connection.commit()
                connection.close()

                self.__other_connections_open -= 1
            except queue.Empty:
                pass

            logger.debug(f"{id}: Finished processing")

    def __del__(self):
        self.__async_query_queue_accepting = False
        self.__immediate_connection.close()
        self.__async_query_queue.join()
        self.__async_query_queue_runner_running = False