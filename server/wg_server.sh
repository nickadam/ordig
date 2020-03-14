#!/bin/bash

while true
do
  python3 daemon.py &>> daemon.log
done
