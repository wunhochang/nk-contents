using GAPI.Common;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GAPI.Entity.Common;
using System.Data;
using System.Text;

namespace GAPI.Entity
{
    public class CpAccountingReport : Gentity
    {
      internal static void GetList(Hashtable condition, ref APIResult result)
      {
          try
          {
              var data = new Hashtable();
              using (var DB = Config.GetDatabase())
              {
                    var sql = DB.GetQuery("cp_accounting_report", "GetList", condition);
                    StringBuilder sbInString = new StringBuilder();
                    
                    sbInString.Append("");

                    if (condition["cp_corp_no"] != null && DBUtils.DataToString(condition["cp_corp_no"]) != "" && DBUtils.DataToString(condition["cp_corp_no"]) != "0")
                    {
                        sbInString.Append(" and a.cp_corp_no = '" + DBUtils.DataToString(condition["cp_corp_no"]) + "' ");
                    }
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());
                    Console.WriteLine(" and {0} ", sql);
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

        internal static void GetCpAccountingReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    sbInString.Append("");
                    if (condition["cp_corp_no"] != null && DBUtils.DataToString(condition["cp_corp_no"]) != "" && DBUtils.DataToString(condition["cp_corp_no"]) != "0")
                    {
                        sbInString.Append(" and a.cp_corp_no = '" + DBUtils.DataToString(condition["cp_corp_no"]) + "' ");
                    }
                    var sql = DB.GetQuery("cp_accounting_report", "GetCpAccountingReport", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());

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
        internal decimal CpConfirm(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    var effected = DB.ExcuteSQL("cp_accounting_report", "CpConfirm", data);

                    return effected;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        

        internal decimal MailSend(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    var effected = DB.ExcuteSQL("cp_accounting_report", "MailSend", data);
                        //effected = DB.ExcuteSQL("cp_accounting_report", "RawCpConfirmCancel", data);

                    return effected;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal decimal Cancel(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    var effected = DB.ExcuteSQL("cp_accounting_report", "CpCancel", data);
                        effected = DB.ExcuteSQL("cp_accounting_report", "RawCpConfirmCancel", data);

                    return effected;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}
