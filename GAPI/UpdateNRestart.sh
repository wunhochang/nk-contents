#!/bin/bash

# include color file
current_dir="$(dirname "$0")"

source "$current_dir/../color.inc"

SCRIPT_NAME=API-Update

#define cmds
CMD_DOTNET=/usr/bin/dotnet
CMD_CP=/bin/cp
CMD_SERVICE=/usr/sbin/service
CMD_SUDO=`which sudo`
CMD_SSHPASS=`which sshpass`


# Echo function
# Please use printf insted echo
function echo_dt(){
        echo `date '+%Y/%m/%d %H:%M:%S'`
}

printf "\n\n${Green}[$(echo_dt)]Start script $0${Color_Off}\n\n"

# Check path
SRC_ROOT=${1:-"/var/App/GAPI"}
printf "[$(echo_dt)][$SCRIPT_NAME]SRC Root = $SRC_ROOT\n\n"
PUBLISH_ROOT=${2:-"/var/www/GAPI"}
printf "[$(echo_dt)][$SCRIPT_NAME]PUBLISH Root = $PUBLISH_ROOT\n\n"

cd $SRC_ROOT

#echo -n 'Enter Password:'
#read -s PASSWD

stty -echo
printf "Password: "
read PASSWORD
#echo "input = $PASSWORD"
stty echo

echo "$PASSWORD" | $CMD_SUDO -S $CMD_SERVICE GAPI stop
printf "\n[$(echo_dt)][$SCRIPT_NAME]API Service Stoped.\n\n"


$CMD_DOTNET restore
printf "[$(echo_dt)][$SCRIPT_NAME]dotnet restore done.\n\n"

$CMD_DOTNET publish -o $PUBLISH_ROOT

printf "[$(echo_dt)][$SCRIPT_NAME]dotnet build done.\n\n"

# $CMD_CP -rf $SRC_ROOT/SQL $PUBLISH_ROOT/

# printf "[$(echo_dt)][$SCRIPT_NAME]SQL Files copy done.\n\n"

echo "$PASSWORD" | $CMD_SUDO -S $CMD_SERVICE GAPI start
printf "[$(echo_dt)][$SCRIPT_NAME]API Service Started.\n\n"


printf "\n\n${Green}[$(echo_dt)]End script $0${Color_Off}\n\n\n"

