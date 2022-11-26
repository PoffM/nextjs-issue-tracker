-- Initialize the databases for dev and test.
-- These should work like "create database if not exists":
SELECT 'CREATE DATABASE devdb'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'devdb')\gexec
SELECT 'CREATE DATABASE testdb'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'testdb')\gexec
