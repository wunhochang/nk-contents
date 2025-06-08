개발 환경

1. 프로그램 설치
  1.1 dotnet core 설치
    - https://www.microsoft.com/net/download/core
	
  1.2 node.js 설치
    - https://nodejs.org/ko/download/
	
  1.3 에디터 설치
    - MS VS Code 추천함
	- https://code.visualstudio.com/download
	- 추천 Extension : ms-vscode.csharp, TwentyChung.jsx, cdsama.tortoise-svn-for-vscode, robertohuertasm.vscode-icons

2. 소스 다운로드
  svn 주소 : 	http://svn.gen-one.com/svn/p_97 (GNF2)
  
3. Server 컴파일 및 실행
  >cd GAPI
  >dotnet restore
  >dotnet build
  >dotnet run

  http://localhost:5554 으로 실행됨

4. Client(React) 실행
  >cd GReactClient
  >npm update
  >npm start
  
  http://localhost:5555 에서 확인
  
참고사항 

1. React 사이트는 수정시 바로 적용됨
2. API 사이트는 실시간 적용하려면 ">dotnet watch" 로 실행하면 가능함
  
	
배포 절차

1. 서버에 ssh 로 접속
2. /var/App/ 이동
3. ./Update.sh 실행


