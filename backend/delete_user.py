import sqlite3
import sys

email = sys.argv[1] if len(sys.argv) > 1 else "ojenarlester@gmail.com"

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Delete user
cursor.execute('DELETE FROM auth_user WHERE email = ?', (email,))
conn.commit()

print(f'User with email {email} deleted successfully')
conn.close()
