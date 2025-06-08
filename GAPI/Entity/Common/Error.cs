namespace GAPI.Entity.Common
{
    public class Error
    {
        public string Code;
        public string Message;

        public Error(string Code, string Message)
        {
            this.Code = Code;
            this.Message = Message;
        }
    }
}