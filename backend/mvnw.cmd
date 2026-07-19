@ECHO OFF
@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM ----------------------------------------------------------------------------

@SETLOCAL
SET BASE_DIR=%~dp0
SET WRAPPER_JAR="%BASE_DIR%.mvn\wrapper\maven-wrapper.jar"

IF NOT EXIST %WRAPPER_JAR% (
    ECHO Downloading Maven Wrapper jar...
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar', '%BASE_DIR%.mvn\wrapper\maven-wrapper.jar')"
)

IF NOT "%JAVA_HOME%"=="" (
    SET JAVACMD="%JAVA_HOME%\bin\java.exe"
) ELSE (
    SET JAVACMD=java.exe
)

%JAVACMD% -classpath %WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%BASE_DIR%" org.apache.maven.wrapper.MavenWrapperMain %*

@ENDLOCAL
