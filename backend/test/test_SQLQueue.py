from unittest import TestCase, mock

from backend.src.database import SQLQueue
from backend.src.exceptions import SingletonException


class TestSQLQueue(TestCase):
    # @mock.patch('mysql.connector')
    # def test_constructor_raises_exception(self, mock_connection):
    #     sql_queue = SQLQueue(host='localhost')
    #     self.assertRaises(SingletonException, SQLQueue, host="localhost")
    #     del sql_queue

    @mock.patch('mysql.connector')
    def test_get_instance_first_time_gets_new_instance(self, mock_connection):
        sql_queue = SQLQueue.get_instance(host="localhost", user="root", password="root")
        self.assertIsInstance(sql_queue, SQLQueue)
        del sql_queue

    @mock.patch('mysql.connector')
    def test_get_instance_second_time_same_gets_same_instance(self, mock_connection):
        sql_queue_1 = SQLQueue.get_instance(host="localhost", user="root", password="root")
        sql_queue_2 = SQLQueue.get_instance(host="localhost", user="root", password="root")
        self.assertEqual(sql_queue_1, sql_queue_2)
        del sql_queue_1
        del sql_queue_2

    @mock.patch('mysql.connector')
    def test_get_instance_second_time_different_gets_new_instance(self, mock_connection):
        sql_queue_1 = SQLQueue.get_instance(host="localhost", user="root", password="root")
        sql_queue_2 = SQLQueue.get_instance(host="localhost", user="test", password="root")
        self.assertNotEqual(sql_queue_1, sql_queue_2)
        del sql_queue_1
        del sql_queue_2
