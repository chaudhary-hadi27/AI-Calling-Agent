#!/usr/bin/env python3
"""Test Neon PostgreSQL connection"""

import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()


async def test_neon():
    # Parse DATABASE_URL
    db_url = os.getenv("DATABASE_URL")

    # Remove postgresql+asyncpg:// prefix for asyncpg
    connection_string = db_url.replace("postgresql+asyncpg://", "postgresql://")

    print(f"🔗 Connecting to Neon DB...")
    print(f"📍 Host: {connection_string.split('@')[1].split('/')[0]}")

    try:
        # Connect to Neon
        conn = await asyncpg.connect(connection_string)

        # Test query
        version = await conn.fetchval('SELECT version()')
        print(f"\n✅ Connected successfully!")
        print(f"📊 PostgreSQL Version: {version[:50]}...")

        # Check if tables exist
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)

        print(f"\n📋 Existing tables: {len(tables)}")
        for table in tables:
            print(f"   - {table['table_name']}")

        await conn.close()
        print("\n✅ Test completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ Connection failed!")
        print(f"Error: {str(e)}")
        return False


if __name__ == "__main__":
    success = asyncio.run(test_neon())
    exit(0 if success else 1)