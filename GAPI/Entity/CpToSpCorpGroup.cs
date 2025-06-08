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
    public class CpToSpCorpGroup : Gentity
    {
      internal static void GetList(Hashtable condition, ref APIResult result)
      {
          try
          {
              var data = new Hashtable();
              using (var DB = Config.GetDatabase())
              {
                    var sql = DB.GetQuery("cp_to_sp_corp_group", "GetList", condition);
                    StringBuilder sbInString = new StringBuilder();
                    sbInString.Append("");
                    if (condition["searchtxt"] != null && DBUtils.DataToString(condition["searchtxt"]) != "")
                    {
                        sbInString.Append(" and b.sp_corp_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                    }
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

      internal static void GetSpCorpList(Hashtable condition, ref APIResult result)
      {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    var sql = DB.GetQuery("cp_to_sp_corp_group", "GetSpCorpList", condition);
                    StringBuilder sbInString = new StringBuilder();
                    sbInString.Append("");
                    if (condition["searchtxt"] != null && DBUtils.DataToString(condition["searchtxt"]) != "")
                    {
                        sbInString.Append(" and sp_corp_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                    }
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


    }
}
