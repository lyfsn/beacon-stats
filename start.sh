
export IP_ADDRESS=$(curl -4 https://icanhazip.com/)

if [ -z "$IP_ADDRESS" ]; then
    echo "Failed to retrieve IP address"
    exit 1
fi

echo "Using IP address: $IP_ADDRESS"


docker compose up --build -d

