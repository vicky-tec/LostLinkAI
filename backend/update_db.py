import sqlite3
import traceback

try:
    conn = sqlite3.connect('lostlink.db', timeout=10)
    cursor = conn.cursor()
    cursor.execute("UPDATE lost_items SET contact_phone = '9876543210' WHERE contact_phone IS NULL")
    cursor.execute("UPDATE found_items SET contact_phone = '9876543211' WHERE contact_phone IS NULL")
    conn.commit()
    conn.close()
    print('Phone numbers updated successfully')
except Exception as e:
    print('Error:', e)
    traceback.print_exc()
