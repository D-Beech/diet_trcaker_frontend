"""
AWS RDS PostgreSQL Database Connection
Connects to USDA nutrition database hosted on AWS RDS
"""
import os
import psycopg2
from psycopg2 import pool
from typing import Optional

# Database configuration from environment
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'sslmode': os.getenv('DB_SSL_MODE', 'require')
}

# Connection pool for efficient database access
connection_pool = None

def init_db_pool():
    """Initialize PostgreSQL connection pool to AWS RDS"""
    global connection_pool
    try:
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            1, 20,
            **DB_CONFIG
        )
        print(f"Connected to AWS RDS: {DB_CONFIG['host']}")
    except Exception as e:
        print(f"Database connection failed: {e}")
        print("  Using fallback AI estimates")

def get_db_connection():
    """Get a connection from the pool"""
    if connection_pool:
        return connection_pool.getconn()
    return None

def release_db_connection(conn):
    """Return connection to the pool"""
    if connection_pool and conn:
        connection_pool.putconn(conn)

def close_db_pool():
    """Close all database connections"""
    if connection_pool:
        connection_pool.closeall()
