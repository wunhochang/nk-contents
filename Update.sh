#!/bin/bash


# include color file
current_dir=$(dirname "$0")

. "$current_dir/color.inc"

GIT_REPO=git.gen-one.com/genone/etc/nk-contents

# Check input arguments
#GIT_USERNAME=${1?"Usage: $0 git_username git_password"}
#GIT_PASSWORD=${2?"Usage: $0 git_username git_password"}

GIT_CMD="/usr/bin/git"

# Echo function
# Please use printf insted echo
echo_dt(){
        echo `date '+%Y/%m/%d %H:%M:%S'`
}

printf "${Blue}[$(echo_dt)]Start script $0${Color_Off}\n"

#echo "[$(echo_dt)]GIT Username = $GIT_USERNAME"

CMD_SH=/bin/bash

SRC_ROOT=`pwd`
PUBLISH_ROOT=/var/www

echo "[$(echo_dt)]Source root directory = $SRC_ROOT"
echo "[$(echo_dt)]Publish root directory = $PUBLISH_ROOT"


echo "Get Source Last version"

#$GIT_CMD pull https://$GIT_USERNAME:$GIT_PASSWORD@$GIT_REPO
$GIT_CMD reset --hard
$GIT_CMD pull --quiet
$GIT_CMD --no-pager log -3 --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative


API_SRC_ROOT=$SRC_ROOT/GAPI
API_PUBLISH_ROOT=$PUBLISH_ROOT/GAPI
echo "[$(echo_dt)]API Source directory = $API_SRC_ROOT"

CLIENT_SRC_ROOT=$SRC_ROOT/GReactClient
CLIENT_PUBLISH_ROOT=$PUBLISH_ROOT/html

# API Server Update
printf "[$(echo_dt)]${BGreen}API Update${Color_Off} and Restart ${BRed}START!!!${Color_Off} \n"
$CMD_SH $API_SRC_ROOT/UpdateNRestart.sh $API_SRC_ROOT $API_PUBLISH_ROOT
printf "[$(echo_dt)]${BGreen}API Update${Color_Off} and Restart ${BRed}DONE!!!!${Color_Off} \n"

#/bin/bash /var/App/GReactClient/UpdateNRestart.sh $1 $2

printf "[$(echo_dt)]${BGreen}CLIENT Update${Color_Off} and Restart ${BRed}START!!!${Color_Off} \n"
$CMD_SH $CLIENT_SRC_ROOT/UpdateNRestart.sh $CLIENT_SRC_ROOT $CLIENT_PUBLISH_ROOT
printf "[$(echo_dt)]${BGreen}CLIENT Update${Color_Off} and Restart ${BRed}DONE!!!!${Color_Off} \n"

printf "${Blue}[$(echo_dt)]End script $0${Color_Off}\n"
