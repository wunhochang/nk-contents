#!/bin/bash
root=/var/App/GReactClient

SCRIPT_NAME=Contents-Update

# Echo function
# Please use printf insted echo
function echo_dt(){
        echo `date '+%Y/%m/%d %H:%M:%S'`
}

printf "\n\n${Green}[$(echo_dt)]Start script $0${Color_Off}\n\n"


cd $root

# dt=`date '+%Y/%m/%d %H:%M:%S'`
# echo "[!!!!!]$dt npm install"
# npm install



# dt=`date '+%Y/%m/%d %H:%M:%S'`
# echo "[!!!!!]$dt npm run build"
printf "\n\n[$(echo_dt)][$SCRIPT_NAME]npm run build START.\n\n"

npm run build
printf "\n\n[$(echo_dt)][$SCRIPT_NAME]npm run build DONE.\n\n"


# dt=`date '+%Y/%m/%d %H:%M:%S'`
# echo "[!!!!!]$dt WebServer Stop"
# service nginx stop


printf "\n\n[$(echo_dt)][$SCRIPT_NAME]npm run copy START.\n\n"
npm run copy
printf "\n\n[$(echo_dt)][$SCRIPT_NAME]npm run copy DONE.\n\n"



# dt=`date '+%Y/%m/%d %H:%M:%S'`
# echo "[!!!!!]$dt WebServer Start"
# service nginx start

printf "\n\n${Green}[$(echo_dt)]End script $0${Color_Off}\n\n\n"