set MONGODIR="C:\Program Files\MongoDB\Server\3.2\bin"
set OLDPATH=%~dp0
cd ..
set BASEPATH=%~dp0
set MONGODPATH=%~dp0tcsdeploy\mongodb
set CDNPATH=%~dp0tcsdeploy\cdn

cd %OLDPATH%

%MONGODIR%\mongod.exe --config "%BASEPATH%\mongo\winmongoconfig.conf"