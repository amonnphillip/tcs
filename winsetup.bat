set MONGODIR="C:\Program Files\MongoDB\Server\3.2\bin"
set OLDPATH=%~dp0
cd ..
set BASEPATH=%~dp0
set MONGODPATH=%~dp0tcsdeploy\mongodb
set CDNPATH=%~dp0tcsdeploy\cdn

if not exist "%BASEPATH%tcsdeploy" (
mkdir tcsdeploy
)

if not exist "%MONGODPATH%" (
mkdir tcsdeploy\mongodb
)

if not exist "%CDNPATH%" (
mkdir tcsdeploy\cdn
)


rem TODO: install mongo if it is not installed as per https://docs.mongodb.org/v2.6/tutorial/install-mongodb-on-windows/

rem TODO: Unpack cdn data on initial deployment

rem %MONGODIR%\mongod.exe --dpath "%MONGODPATH%"

if exist "%BASEPATH%tcsdeploy\vars.bat" (
del tcsdeploy\vars.bat
)

(
echo set MONGODPATH=%MONGODPATH%
echo set CDNPATH=%CDNPATH%

%MONGODIR%\mongod.exe --dpath "%MONGODPATH%"

) > tcsdeploy\startmongo.bat

cd %OLDPATH%

