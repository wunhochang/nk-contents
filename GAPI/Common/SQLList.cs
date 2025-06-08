using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace GAPI.Common
{
    public class SQLList
    {

        public List<SQL> SQLs = new List<SQL>();

        public SQLList()
        {
            ReadFiles();
        }

        private void ReadFiles()
        {
            try
            {
                ILogger _logger = Logging.CreateLogger<SQLList>();

                _logger.LogInformation("ReadFiles");

                SQLs.Clear();

                string sqlPath = Config.GetSqlPath();

                string[] sqlfilesArray = Directory.GetFiles(sqlPath, "*.sql");

                _logger.LogInformation("sqlfilesArray count=" + sqlfilesArray.Length.ToString());

                List<string> sqlfiles = sqlfilesArray.ToList();

                sqlfiles.Sort();

                _logger.LogInformation("sqlfiles count=" + sqlfiles.Count.ToString());

                foreach (string file in sqlfiles)
                {
                    _logger.LogInformation("Read sql :" + file);

                    ReadSQL(file);
                }

                foreach (var sql in SQLs)
                {
                    _logger.LogDebug("SQL : " + sql);
                }
            }
            catch (Exception ex)
            {
                ILogger _logger = Logging.CreateLogger<SQLList>();

                _logger.LogCritical("Exception : " + ex.ToString());
                throw ex;
            }
        }

        private void ReadSQL(string file)
        {
            try
            {
                ILogger _logger = Logging.CreateLogger<SQLList>();

                string name = string.Empty;
                string sql = string.Empty;

                var fi = new FileInfo(file);
                string fileName = fi.Name.Replace(fi.Extension, "");

                using (Stream st = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    // Stream st = new FileStream(file, FileMode.Open);

                    using (StreamReader sr = new StreamReader(st))
                    {
                        while (sr.Peek() >= 0)
                        {
                            string tmp = sr.ReadLine().TrimStart();

                            if (tmp.Length > 3 && tmp.Substring(0, 3) == "--[") // SQL Name
                            {
                                if (String.IsNullOrWhiteSpace(name) == false
                                    && String.IsNullOrWhiteSpace(sql) == false
                                )
                                {
                                    var SQL = new SQL(fileName, name, sql);
                                    SQLs.Add(SQL);
                                    sql = "";

                                    _logger.LogDebug("SQL : " + SQL.ToString());
                                }

                                tmp = tmp.Trim();

                                name = tmp.Substring(3, tmp.Length - 4); // "--[]".Length <- 4
                            }
                            else if (tmp.Length > 4 && tmp.Substring(0, 4) == "-- [") // SQL Name
                            {
                                if (String.IsNullOrWhiteSpace(name) == false
                                    && String.IsNullOrWhiteSpace(sql) == false
                                )
                                {
                                    var SQL = new SQL(fileName, name, sql);
                                    SQLs.Add(SQL);
                                    sql = "";

                                    _logger.LogDebug("SQL : " + SQL.ToString());
                                }

                                tmp = tmp.Trim();

                                name = tmp.Substring(4, tmp.Length - 5); // "--[]".Length <- 4
                            }
                            else
                            {
                                if (tmp.Length > 2 && tmp.Substring(0, 2) == "--") // Comment
                                {
                                    continue;
                                }

                                sql += "\n " + tmp.Trim().TrimEnd(';');
                            }
                        }

                        if (String.IsNullOrWhiteSpace(name) == false
                            && String.IsNullOrWhiteSpace(sql) == false
                        )
                        {

                            var SQL = new SQL(fileName, name, sql);
                            SQLs.Add(SQL);
                            sql = "";

                            _logger.LogDebug("SQL : " + SQL.ToString());
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }

    public class SQL
    {
        public SQL(string fileName, string SQLName, string SQLString)
        {
            // TODO: Complete member initialization
            this.fileName = fileName;
            this.SQLName = SQLName;
            this.SQLString = SQLString;
        }

        public string fileName { get; set; }

        public string SQLName { get; set; }

        public string SQLString { get; set; }

        public override string ToString()
        {
            return "[" + fileName + "]" + SQLName;
        }
    }
}
