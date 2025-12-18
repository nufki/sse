#!/bin/bash
echo "Threads before load:"
curl -s localhost:8085/actuator/metrics/jvm.threads.live | jq '.value'

# Spawn 500 SSE connections
for i in {1..500}; do curl -N localhost:8085/news & done
sleep 2
echo "Threads after 500 SSE clients:"
curl -s localhost:8085/actuator/metrics/jvm.threads.live | jq '.value'
