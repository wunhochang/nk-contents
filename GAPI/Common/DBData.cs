namespace GAPI.Common
{
    internal class DBData
    {
        private string name;
        private object value;
        public string TypeName;

        public object Value {
            get => (System.DBNull.Value == value) ? null:value;
            set => this.value = value;
        }

        public string Name {
            get => name;
            set => name = value;
        }

        public DBData()
        {
        }

        public DBData(string name, object value, string typeName)
        {
            this.Name = name;
            this.Value = value;
            this.TypeName = typeName;
        }
    }
}