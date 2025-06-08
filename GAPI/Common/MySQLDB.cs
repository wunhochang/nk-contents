using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MySql.Data.MySqlClient;
using System.Data;
using System.Collections;
using System.IO;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace GAPI.Common
{
    public class MySQLDB : IDatabase
    {
        MySqlConnection _conn = null;//new MySqlConnection();

        private string connectString;

        ILogger _logger { get; } = Logging.CreateLogger<IDatabase>();

        public MySQLDB(string connectString)
        {
            this.connectString = connectString;
        }

        private void Open()
        {
            _logger.LogDebug("Mysql DB Open. connect string = {0}", connectString);

            if (_conn == null)
                _conn = new MySqlConnection();

            int tryCount = 5;

            while (_conn.State != ConnectionState.Open)
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(connectString))
                    {
                        _conn.ConnectionString = Config.Database.ConnectString;
                    }
                    else
                    {
                        _conn.ConnectionString = this.connectString;
                    }

                    _conn.Open();
                }
                //catch (MySqlException ex)
                //{
                //    // 12545 : Host Not found

                //    if (ex.Code == 12170 || ex.Code == 12545)
                //    {
                //        // Next Connect
                //        if (ConnectChanged != null)
                //        {
                //            ConnectChanged(this, new EventArgs());
                //        }
                //    }
                //    else
                //    {
                //        throw ex;
                //    }
                //}
                catch (Exception ex)
                {
                    throw ex;
                }

                if (tryCount-- == 0)
                {
                    throw new Exception("DB Connect try failed.");
                }
            }
        }

        private void Close()
        {
            _logger.LogDebug("Mysql DB Close. connect state = {0}", _conn.State);

            if ((_conn != null) && (_conn.State != ConnectionState.Closed))
            {
                _conn.Close();
            }
        }

        public void Dispose()
        {
            _logger.LogDebug("Mysql DB Dispose.");

            if (_conn != null)
            {
                this.Close();
                _conn.Dispose();
            }
        }

        public decimal ExcuteSQL(String fileName, String sqlName, Hashtable parameters = null)
        {
            string sql = GetQuery(fileName, sqlName, parameters);

            return ExcuteSQL(sql, parameters);
        }

        public decimal ExcuteSQL(String query, Hashtable parameters = null)
        {
            try
            {
                this.Open();

                _logger.LogDebug("Mysql ExcuteSQL. SQL={0}, Params={2}", query, JsonConvert.SerializeObject(parameters));


                using (MySqlCommand cmd = new MySqlCommand(query, this._conn))
                {
                    FillParameter(query, parameters, cmd);
                    var effected = cmd.ExecuteNonQuery();

                    return effected;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally { }
        }

        public object GetOneValue(string query)
        {
            var dt = GetDataTable(query);

            if (dt == null || dt.Count == 0)
                return null;

            return dt[0][0];
        }

        public List<Hashtable> GetDataTable(String fileName, String sqlName, Hashtable parameters = null)
        {
            string sql = GetQuery(fileName, sqlName, parameters);

            return GetDataTable(sql, parameters);
        }

        public List<Hashtable> GetDataTable(String query, Hashtable parameters = null)
        {
            try
            {
                this.Open();

                _logger.LogDebug("Mysql GetDataTable. SQL={0}, Params={2}", query, JsonConvert.SerializeObject(parameters));

                //#if debug
                //DBQuery debugquery = new DBQuery(query, parameters);
                //#endif
                List<Hashtable> hsRecords = new List<Hashtable>();

                using (MySqlCommand cmd = new MySqlCommand(query, this._conn))
                {
                    FillParameter(query, parameters, cmd);

                    //Logger.Instance.LogDebug(makeDebugString(cmd));

                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            Hashtable row = new Hashtable();

                            for (int i = 0; i < reader.FieldCount; i++)
                            {

                                DBData data = new DBData(reader.GetName(i),
                                    reader.GetValue(i),
                                    reader.GetFieldType(i).Name
                                    );

                                //row.Add(data.Name, data);
                                row.Add(data.Name, data.Value);
                                row.Add(i, data.Value);
                            }

                            hsRecords.Add(row);
                        }
                    }
                }

                if (hsRecords.Count == 0)
                    return null;

                return hsRecords;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally { }
        }

        private void FillParameter(String query, Hashtable parameters, MySqlCommand command)
        {
            command.Parameters.Clear();

            if (parameters == null || parameters.Keys.Count == 0)
            {
                return;
            }

            query += " ";

            var rcvParams = new Hashtable();

            foreach (DictionaryEntry p in parameters)
            {
                rcvParams.Add(p.Key.ToString().ToLower(), p.Value);
            }

            List<string> paramList = ExtractParam(query);

            foreach (var param in paramList)
            {
                if (rcvParams.ContainsKey(param))
                {
                    //var rcvParam = rcvParams[param];
                    var value = rcvParams[param];

                    command.Parameters.Add(new MySqlParameter(param, value));
                }
                else
                {
                    command.Parameters.Add(new MySqlParameter(param, DBNull.Value));
                }

            }
            /*



            string[] queries = query.Split(':');


            for (int i = 1; i < queries.Length; i++)
            {
                String newKey = this.StripParameter(queries[i]);
                Object value = DBNull.Value;

                Boolean isfind = false;
                foreach (string key in parameters.Keys)
                {
                    if (newKey.ToUpper() == key.ToUpper())
                    {
                        value = parameters[key];
                        isfind = true;
                        break;
                    }
                }

                if (isfind)
                {
                    if (command.Parameters.Contains(newKey) == false)
                    {
                        if (value == null)
                        {
                            value = DBNull.Value;
                        }
                        command.Parameters.Add(new MySqlParameter(newKey, value));
                    }
                }
            }*/
        }

        private List<string> ExtractParam(string query)
        {
            string[] queries = query.Split('@');

            List<string> result = new List<string>();

            foreach (var q in queries)
            {
                var striped = StripParameter(q).ToLower();

                if (String.IsNullOrWhiteSpace(striped))
                    continue;

                if (result.Contains(striped) == false)
                {
                    result.Add(striped);
                }
            }

            return result;
        }

        public String StripParameter(String parameter)
        {
            int endIdx = 0;

            for (int i = 0; i < parameter.Length; i++)
            {
                if (((parameter[i] >= 'a' && parameter[i] <= 'z')
                    || (parameter[i] >= 'A' && parameter[i] <= 'Z')
                    || (parameter[i] >= '0' && parameter[i] <= '9')
                    || (parameter[i] == '_')
                    || (parameter[i] == '-')) == false)
                {
                    endIdx = i;
                    break;
                }
                endIdx = i;
            }

            return parameter.Substring(0, endIdx);
        }

        public String GetQuery(String sqlFileName, String sqlName, Hashtable parameters = null)
        {
            if (Config.IsDevelopment)
            {
                string name = string.Empty;
                string sql = string.Empty;

                var SQLPath = Config.GetSqlPath();

                var fileName = SQLPath + "/" + sqlFileName + ".sql";
                var query = string.Empty;

                // Stream st = new FileStream(fileName, FileMode.Open);
                using (Stream st = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
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
                                    //SQLs.Add(new SQL(fileName, name, sql));
                                    if (name.ToUpper() == sqlName.ToUpper())
                                    {
                                        query = sql;
                                        break;
                                    }

                                    sql = "";
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
                                    //SQLs.Add(new SQL(fileName, name, sql));
                                    if (name.ToUpper() == sqlName.ToUpper())
                                    {
                                        query = sql;
                                        break;
                                    }

                                    sql = "";
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

                        if (name.ToUpper() == sqlName.ToUpper())
                        {
                            query = sql;
                        }
                    }
                }

                if (parameters != null)
                {
                    foreach (String key in parameters.Keys)
                    {
                        String keyvalue = "{" + key + "}";
                        String value = "";
                        if (parameters[key] != null)
                        {
                            value = parameters[key].ToString();
                        }

                        if (query.Contains(keyvalue))
                        {
                            if (keyvalue.Equals("{orderby}"))
                            {
                                if (String.IsNullOrWhiteSpace(value))
                                {
                                    value = " 1 ";
                                }

                                query = query.Replace("{orderby}", " ORDER BY " + value);
                            }
                            else if (keyvalue.Equals("{notin}"))
                            {
                                if (String.IsNullOrWhiteSpace(value))
                                {
                                    value = " '-1' ";
                                }

                                query = query.Replace("{notin}", " NOT IN (" + value + ")");
                            }
                            else
                            {
                                query = query.Replace(keyvalue, value);
                            }
                        }
                    }
                }

                query = query.Replace("{orderby}", String.Empty);
                query = query.Replace("{notin}", String.Empty);

                return ConvertSQL(query);
            }
            else
            {
                foreach (var sql in Config.SQLList.SQLs)
                {
                    if (sql.fileName.ToUpper() == sqlFileName.ToUpper() && sql.SQLName.ToUpper() == sqlName.ToUpper())
                    {
                        String query = sql.SQLString;

                        if (parameters != null)
                        {
                            foreach (String key in parameters.Keys)
                            {
                                String keyvalue = "{" + key + "}";
                                String value = "";
                                if (parameters[key] != null)
                                {
                                    value = parameters[key].ToString();
                                }

                                if (query.Contains(keyvalue))
                                {
                                    if (keyvalue.Equals("{orderby}"))
                                    {
                                        if (String.IsNullOrWhiteSpace(value))
                                        {
                                            value = " 1 ";
                                        }

                                        query = query.Replace("{orderby}", " ORDER BY " + value);
                                    }
                                    else if (keyvalue.Equals("{notin}"))
                                    {
                                        if (String.IsNullOrWhiteSpace(value))
                                        {
                                            value = " '-1' ";
                                        }

                                        query = query.Replace("{notin}", " NOT IN (" + value + ")");
                                    }
                                    else
                                    {
                                        query = query.Replace(keyvalue, value);
                                    }
                                }
                            }
                        }

                        query = query.Replace("{orderby}", String.Empty);
                        query = query.Replace("{notin}", String.Empty);

                        return ConvertSQL(query);
                    }
                }

                throw new Exception("SQL Not Exist, " + sqlFileName + "," + sqlName);
            }
        }

        private string ConvertSQL(string sql)
        {
            var sqls = sql.Split('\'');

            var newSql = "";

            for (var i = 0; i < sqls.Length; i++)
            {

                if (i % 2 == 0)
                {

                    var partitialSql = sqls[i];
                    partitialSql = partitialSql.Replace(':', '@');
                    partitialSql = partitialSql.Replace("sysdate", "CURRENT_TIMESTAMP");

                    newSql += partitialSql;
                }
                else
                {
                    newSql += '\'' + sqls[i] + '\'';
                }
            }

            return newSql;
        }

        public decimal GetNextSeq(string tableName)
        {
            var query = "CALL SequenceGetNextVal('" + tableName.ToUpper() + "')";

            var paramArray = new Hashtable();

            var seq = GetOneValue(query);

            return (decimal)DBUtils.DataToDecimal(seq);
        }

    }
}
