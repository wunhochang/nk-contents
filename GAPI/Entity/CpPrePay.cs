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
    public class CpPrePay : Gentity
    {
      internal static void GetList(Hashtable condition, ref APIResult result)
      {
          try
          {
              var data = new Hashtable();
              using (var DB = Config.GetDatabase())
              {
                    var sql = DB.GetQuery("cp_pre_pay", "GetList", condition);
 
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



        internal decimal CpPrePayConfirm(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    var effected = DB.ExcuteSQL("cp_pre_pay", "CpPrePayConfirm", data);

                    return effected;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal decimal MailSendLog(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    var effected = DB.ExcuteSQL("cp_pre_pay", "MailSendLog", data);

                    return effected;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        internal decimal CpPrePayCancel(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    var effected = DB.ExcuteSQL("cp_pre_pay", "CpPrePayCancel", data);

                    return effected;
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
                    var sql = DB.GetQuery("cp_corp_detail", "GetComboList", condition);

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
    }
}
