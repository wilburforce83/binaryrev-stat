## Install

`git clone https://github.com/wilburforce83/binaryrev-stat.git`

`cd binaryrev-stat` and `npm install`.

## binary.sh

You will need to get your dev details from login.binary.com from [here](https://login.binary.com/authorisation.php) You will aso need to enable authorisation status.

make a file (`mkdir binary.sh`) named `binary.sh` and paste this code in changing the client id and secret to yours:

```
#!/usr/bin/env bash

### NOTE ###
# please change CLIENT_ID, CLIENT_SECRET and STATS_DOMAIN below to reflect your environment

CLIENT_ID=Your_ID_Here
CLIENT_SECRET=Secret_Client_Id

STATS_DOMAIN=login.binary.com

###############################

set -o errexit
set -o nounset


DATE="/bin/date"
CURL="/usr/bin/curl"
SED="/bin/sed"
STAT="/usr/bin/stat"
GREP="/bin/grep"

rm -f stats.csv
sleep 30

# The dates to fetch the report for.
STATS_DATE_FROM="$(${DATE} +%Y-%m-01)"
STATS_DATE_TO="$(${DATE} +%Y-%m-%d)"

SCOPES="r_user_stats"
GRANT_TYPE="client_credentials"

ACCESS_TOKEN_CACHE="/tmp/${CLIENT_ID}.token"

# check if our access token cache is less than an hour old
if [[ -s "${ACCESS_TOKEN_CACHE}" ]] && [[ $(${DATE} -d "now - $( ${STAT} -c "%Y" ${ACCESS_TOKEN_CACHE} ) seconds" +%s) -lt 3600 ]] ; then
    #get token from the cache file
    ACCESS_TOKEN="$(echo "$(cat "${ACCESS_TOKEN_CACHE}")")"
else # the access token has expired, time to get a new token
    # Perform request for an Access Token with your CLIENT_ID and CLIENT_SECRET
    RESPONSE="$(${CURL} -sS -d grant_type="${GRANT_TYPE}" -d client_id="${CLIENT_ID}" -d client_secret="${CLIENT_SECRET}" -d scope="${SCOPES}" https://${STATS_DOMAIN}/oauth/access_token)"

    # Fish out the access token from the response (this should be replaced with a json aware utility)
    ACCESS_TOKEN="$(echo "${RESPONSE}" |  ${GREP} 'access_token":"' | ${SED} -r 's/^.*access_token":"([^"]+)".*$/\1/')"

    # if not token was found, display the error response given and exit
    if [[ ${ACCESS_TOKEN} == '' ]] ; then
        echo ${RESPONSE}
        exit 1
    fi
    echo "${ACCESS_TOKEN}" > "${ACCESS_TOKEN_CACHE}"
fi


# Request the Detailed Activity Report with your Access Token.
${CURL} -sS -H "Authorization: Bearer ${ACCESS_TOKEN}" "https://${STATS_DOMAIN}/statistics.php?d1=${STATS_DATE_FROM}&d2=${STATS_DATE_TO}&sd=1&mode=csv&sbm=1&dnl=1" >> stats.csv

```
then `chmod +x binary.sh` to allow it to be executable.

