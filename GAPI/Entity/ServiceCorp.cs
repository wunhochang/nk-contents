using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Primitives;
using System.Security.Principal;
using GAPI.Common;
using System.Collections;
using Microsoft.Extensions.Logging;
using GAPI.Entity.Common;
using System.Text;

namespace GAPI.Entity
{
    internal class ServiceCorp
    {
        ILogger _logger { get; } = Logging.CreateLogger<Gentity>();
        public string table_name;

        internal static void GetList(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    var sql = DB.GetQuery("service_corp", "GetList", condition);
                    StringBuilder sbInString = new StringBuilder();
                    String in_limit = "";
                    sbInString.Append("");

                    if (condition["searchtxt"] != null && DBUtils.DataToString(condition["searchtxt"]) != "")
                    {
                        sbInString.Append(" and (service_corp_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or service_corp_code like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or manager_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or manager_tel like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or manager_email like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%') ");
                    }

                    if (condition["use_yn"] != null && DBUtils.DataToString(condition["use_yn"]) != "")
                    {
                        sbInString.Append(" and use_yn = '" + DBUtils.DataToString(condition["use_yn"]) + "' ");
                    }
                    if (condition["list_type"] == null || DBUtils.DataToString(condition["list_type"]) == "")
                    {
                        if (DBUtils.DataToString(condition["page"]) != "" && DBUtils.DataToString(condition["limit"]) != "")
                        {
                            in_limit = " LIMIT " + DBUtils.DataToString(condition["start"]) + " , " + DBUtils.DataToString(condition["limit"]);
                        }
                    }

                    sql = sql.Replace("{IN_STR}", sbInString.ToString());
                    sql = sql.Replace("{IN_ORDER_BY}", DBUtils.DataToString(condition["ordby"]));
                    sql = sql.Replace("{IN_LIMIT}", in_limit);

                    var dt = DB.GetDataTable(sql, condition);

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

        internal static void GetComboList(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    var sql = DB.GetQuery("service_corp", "GetComboList", condition);

                    var dt = DB.GetDataTable(sql, condition);

                    if (dt != null && dt.Count > 0)
                    {
                        result.Data = dt;
                        result.Success = true;
                        result.count = dt.Count;
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
        internal decimal Insert(Hashtable data)
        {
            try
            {
                table_name = "service_corp";
                _logger.LogInformation("Entity Insert called, Entity name = " + this.GetType().Name + ", table name = " + table_name);
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
                table_name = "service_corp";
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
    }
}