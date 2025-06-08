사용방법

1. dotnet core 를 다운받아 설치한다. 
  https://www.microsoft.com/net/download/core
2. cmd 창을 열고 소스 다운로드 디렉토리로 이동한다.

3. dir>dotnet restore

4. dir>dotnet build

5. dir>dotnet run
  또는 
   dir>dotnet watch


컨트롤러 추가 방법

1. Controllers 폴더의 SampleController.cs 를 복사하여
  XXXController.cs 로 추가한다.
  XXX 는 entity 이름 테이블 이름과 맞추어 줄 것

2. Entity 폴더의 Sample.cs 를 복사하여
   XXX.cs 로 추가한다.

3. SQL 폴더 아래의 sample.sql 을 복사하여 xxx.sql 로 추가한다.
   [Info], [List], [Insert], [Update], [Delete] sql 문을 작성한다.

4. Get, Get/id, Post, Put/id, Delete/id 이 외의 액션이 필요할 경우 
   SampleActionController.cs 를 복사하여 사용한다.


** 2023 년 10 월
다시 살리기 작업

1. dotnet core 2.1 로 프레임워크 전환
2. npm start 로 개발 모드 시작 가능하도록 수정
