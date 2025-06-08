namespace GAPI.Common
{
    public class DatabaseConfig
    {
        private string _connectString;

        // 나중에 이중화 구성 필요
        public string Type;

        public string ConnectString
        {
            get
            {
                return _connectString;
            }
            set
            {
                _connectString = value;
            }
        }
    }
}