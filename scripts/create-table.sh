#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get MYSQL_PASSWORD as first arg 
MYSQL_PASSWORD=$1

sed -i "s|MYSQL_DB_PASSWORD_HERE|$MYSQL_PASSWORD|" "$SCRIPT_DIR/sql/billtracker.sql"

mysql -hlocalhost -P3306 -uroot -p"$MYSQL_PASSWORD" -v -v -f < "$SCRIPT_DIR/sql/billtracker.sql" 2>&1 | more

echo "done..."
read -p "Press Enter to continue"

