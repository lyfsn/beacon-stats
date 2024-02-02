
if [ -z "$IP_ADDRESS" ]; then
    echo "Failed to retrieve IP address"
    exit 1
fi

echo "Using IP address: $IP_ADDRESS"


docker-compose up --build -d

