#!/bin/bash
CURRENT_DATE=$(date +%s)
NUMBER_OF_TRADES=100
FILENAME='test.csv'
ACCOUNT_NAME='test'
INTERVAL=3600


if [ "$1" != "" ]; then
    NUMBER_OF_TRADES=$1
fi

if [ "$2" != "" ]; then
    FILENAME=$2
fi

echo "from,quantity_from,to,quantity_to,account_name,date,id" >> $FILENAME

for (( c=1; c<=NUMBER_OF_TRADES; c=c+3 ))
do
    echo ",0,usd,4200,$ACCOUNT_NAME,$((CURRENT_DATE - INTERVAL*c)),$c"  >> $FILENAME
    echo "usd,4000,bitcoin,1,$ACCOUNT_NAME,$((CURRENT_DATE - INTERVAL*c)),$((c+1))" >> $FILENAME
    echo "usd,130,ethereum,1,$ACCOUNT_NAME,$((CURRENT_DATE - INTERVAL*c)),$((c+2))" >> $FILENAME
done
# from,quantity_from,to,quantity_to,account_name,date,id
# ,0,usd,4000,test,1571250600,1
# usd,4000,bitcoin,1,test,1571250600,2
# ,0,ripple,1,test,1571337000,3
# bitcoin,0.1,usd,800,test,1571423400,4
