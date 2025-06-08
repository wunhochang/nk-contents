using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Primitives;
using System.Security.Principal;
using GAPI.Common;
using System.Collections;
using GAPI.Controllers;
using Microsoft.Extensions.Logging;
using GAPI.Entity.Common;

namespace GAPI.Entity
{
    public class Upload : Gentity
    {
        new ILogger _logger { get; } = Logging.CreateLogger<Gentity>();

        public decimal InsertFile(Hashtable data)
        {
            try
            {
                _logger.LogInformation("Entity Insert called, Entity name = " + this.GetType().Name + ", table name = " + table_name);

                using (var DB = Config.GetDatabase())
                {
                    //var id = DB.GetNextSeq(table_name);
                    var id = DB.GetNextSeq("filee");
                    data["filee" + "_no"] = id;                    

                    var effected = DB.ExcuteSQL("file", "Insert", data);

                    return id;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public decimal ChangeControlFileTrans(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    var effected = DB.ExcuteSQL("filee", "ChangeControlFileTrans", data);

                    return effected;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal decimal UpdateFiles(List<Hashtable> files, decimal id, decimal oper_user_no)
        {
            try
            {
                var table_name = "filee"; // 요기서만 사용

                _logger.LogInformation("Entity UpdateFiles called, Entity name = " + this.GetType().Name + ", table name = " + table_name);

                using (var DB = Config.GetDatabase())
                {
                    decimal effected = 0;

                    foreach(var file in files)
                    {
                        file["ref_key"] = id;
                        file["oper_user_no"] = oper_user_no;
                        file["temp_yn"] = "N";

                        effected += DB.ExcuteSQL(table_name, "UpdateRef", file);
                    }

                    return effected;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal static void GetList(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    var sql = DB.GetQuery("filee", "GetList", condition);
                    //sql = sql.Replace("{IN_STR}", DBUtils.DataToString(data["ids"]));

                    var dt = DB.GetDataTable(sql, condition);
                    //var dt = DB.GetDataTable("common_code", "GetList", condition);

                    if (dt != null && dt.Count > 0)
                    {
                        result.Data = dt;
                        result.Success = true;
                        result.count = (decimal)DBUtils.DataToDecimal(dt[0]["total_count"].ToString());

                    }
                    else
                    {
                        result.Data = null;
                        result.Success = true;
                        result.count = 0;
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}