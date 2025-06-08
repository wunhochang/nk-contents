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
using System.Data;
using System.Text;

namespace GAPI.Entity
{
    public class User : Gentity
    {
        public User()
        {
        }

        internal void GetList(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    var sql = DB.GetQuery("user", "GetList", condition);
                    StringBuilder sbInString = new StringBuilder();
                    String in_limit = "";
                    sbInString.Append("");

                    if (condition["searchtxt"] != null && DBUtils.DataToString(condition["searchtxt"]) != "")
                    {
                        sbInString.Append(" and (a.user_id like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or a.user_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or a.user_tel like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or a.user_email like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%') ");
                    }
                    if (condition["use_yn"] != null && DBUtils.DataToString(condition["use_yn"]) != "")
                    {
                        sbInString.Append(" and a.use_yn = '" + DBUtils.DataToString(condition["use_yn"]) + "' ");
                    }
                    if (condition["confirm_yn"] != null && DBUtils.DataToString(condition["confirm_yn"]) != "")
                    {
                        sbInString.Append(" and a.confirm_yn = '" + DBUtils.DataToString(condition["confirm_yn"]) + "' ");
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

        internal decimal? GetUserNoByID(string user_id)
        {
            try
            {
                var data = new Hashtable();

                data.Add("user_id", user_id);

                if (data.ContainsKey("use_yn") == false)
                    data["use_yn"] = "Y";

                if (data.ContainsKey("del_yn") == false)
                    data["del_yn"] = "N";

                using (var DB = Config.GetDatabase())
                {
                    var dt = DB.GetDataTable(table_name, "GetUserNoByID", data);

                    if(dt != null && dt.Count > 0)
                    {
                        return DBUtils.DataToDecimal(dt[0][0]);
                    }
                    else
                    {
                        return null;
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal IEnumerable<Hashtable> GetUserInfoByID(string user_id)
        {
            try
            {
                var data = new Hashtable();

                data.Add("user_id", user_id);

                if (data.ContainsKey("use_yn") == false)
                    data["use_yn"] = "Y";

                if (data.ContainsKey("del_yn") == false)
                    data["del_yn"] = "N";

                using (var DB = Config.GetDatabase())
                {
                    var dt = DB.GetDataTable(table_name, "GetUserNoByID", data);

                    if (dt != null && dt.Count > 0)
                    {
                        return dt;
                    }
                    else
                    {
                        return null;
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal new decimal Insert(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    var id = DB.GetNextSeq(table_name);
                    data[table_name + "_no"] = id;

                    var passwd = data["user_pwd"].ToString();
                    var enc_passwd = PasswdEncrypt.Encrypt(passwd);
                    data["user_pwd"] = enc_passwd;

                    var effected = DB.ExcuteSQL(table_name, "Insert", data);
                    
                    return id;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal new decimal UserUpdate(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    var passwd = data["user_pwd"].ToString();
                    var enc_passwd = PasswdEncrypt.Encrypt(passwd);
                    data["user_pwd"] = enc_passwd;

                    var effected = DB.ExcuteSQL(table_name, "UserUpdate", data);

                    return effected;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal new decimal InitPasswd(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    var passwd = data["user_pwd"].ToString();
                    var enc_passwd = PasswdEncrypt.Encrypt(passwd);
                    data["user_pwd"] = enc_passwd;

                    var effected = DB.ExcuteSQL(table_name, "InitPasswd", data);

                    return effected;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal IEnumerable<Hashtable> MailCheck(string type_name)
        {
            try
            {
                var data = new Hashtable();

                data.Add("type_name", type_name);

                using (var DB = Config.GetDatabase())
                {
                    var dt = DB.GetDataTable(table_name, "Mail_Check", data);

                    if (dt != null && dt.Count > 0)
                    {
                        return dt;
                    }
                    else
                    {
                        return null;
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal IEnumerable<Hashtable> IdCheck(string user_id)
        {
            try
            {
                var data = new Hashtable();

                data.Add("user_id", user_id);

                using (var DB = Config.GetDatabase())
                {
                    var dt = DB.GetDataTable(table_name, "ID_Check", data);

                    if (dt != null && dt.Count > 0)
                    {
                        return dt;
                    }
                    else
                    {
                        return null;
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