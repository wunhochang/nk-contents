using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GAPI.Entity;

namespace GAPI.Common
{
    interface IDatabase : IDisposable
    {
        List<Hashtable> GetDataTable(String fileName, String sqlName, Hashtable parameters = null);
        List<Hashtable> GetDataTable(String query, Hashtable parameters = null);

        decimal ExcuteSQL(String fileName, String sqlName, Hashtable parameters = null);
        decimal ExcuteSQL(String query, Hashtable parameters = null);

        decimal GetNextSeq(string tableName);

        String GetQuery(String sqlFileName, String sqlName, Hashtable parameters = null);
    }
}
