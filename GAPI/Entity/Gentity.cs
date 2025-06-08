using GAPI.Common;
using Microsoft.Extensions.Logging;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace GAPI.Entity
{
    public class Gentity
    {
        ILogger _logger { get; } = Logging.CreateLogger<Gentity>();

        public string table_name;
        
        public Gentity()
        {        
            this.table_name = StringUtils.SplitCamelCase(this.GetType().Name)
                .ToLower();

            _logger.LogInformation("Entity created. Entity name = " + this.GetType().Name + ", table name = " + table_name);
        }        

        internal IEnumerable<Hashtable> List(Hashtable data)
        {
            try
            {
                _logger.LogInformation("Entity List called, Entity name = " + this.GetType().Name + ", table name = " + table_name);

                using (var DB = Config.GetDatabase())
                {
                    return DB.GetDataTable(table_name, "List", data);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal decimal Insert(Hashtable data)
        {
            try
            {
                _logger.LogInformation("Entity Insert called, Entity name = " + this.GetType().Name + ", table name = " + table_name);
                
                if(table_name == "pre_run_check")
                {
                    table_name = "prerun_check";
                }
                using (var DB = Config.GetDatabase())
                {
                    var id = DB.GetNextSeq(table_name);
                    data[table_name + "_no"] = id;
                    
                    var effected = DB.ExcuteSQL(table_name, "Insert", data);
                    
                    return id;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal decimal Update(Hashtable data)
        {
            try
            {
                _logger.LogInformation("Entity Update called, Entity name = " + this.GetType().Name + ", table name = " + table_name);
                
                using (var DB = Config.GetDatabase())
                {
                    return DB.ExcuteSQL(table_name, "Update", data);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal bool Delete(Hashtable data)
        {
            try
            {
                _logger.LogInformation("Entity Delete called, Entity name = " + this.GetType().Name + ", table name = " + table_name);
                
                using (var DB = Config.GetDatabase())
                {
                    return (DB.ExcuteSQL(table_name, "Delete", data) > 0);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal bool DeleteMulti(Hashtable data)
        {
            try
            {
                _logger.LogInformation("Entity DeleteMulti called, Entity name = " + this.GetType().Name + ", table name = " + table_name);
                
                using (var DB = Config.GetDatabase())
                {
                    var sql = DB.GetQuery(table_name, "DeleteMulti", data);
                    sql = sql.Replace("{IN_STR}", DBUtils.DataToString(data["ids"]));

                    return (DB.ExcuteSQL(sql, data) > 0);
                }                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
