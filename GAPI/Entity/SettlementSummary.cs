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
    public class SettlementSummary : Gentity
    {
      internal static void GetList(Hashtable condition, ref APIResult result)
      {
          try
          {
              var data = new Hashtable();
              using (var DB = Config.GetDatabase())
              {
                    var sql = DB.GetQuery("settlement_summary", "GetList", condition);
                    StringBuilder sbInString = new StringBuilder();
                    String in_limit = "";
                    sbInString.Append("");

                    if(condition["searchtxt"] != null && DBUtils.DataToString(condition["searchtxt"]) != "")
                    {
                        sbInString.Append(" and (a.settlement_title like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or b.settlement_type_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or c.service_corp_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or c.manager_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%') ");
                    }
                    if ((condition["st_date"] != null && DBUtils.DataToString(condition["st_date"]) != "") && (condition["end_date"] != null && DBUtils.DataToString(condition["end_date"]) != ""))
                    {
                        sbInString.Append(" and a.settlement_date between '" + DBUtils.DataToString(condition["st_date"]) + "' and '" + DBUtils.DataToString(condition["end_date"])  + "' ");
                    }
                    if (condition["status"] != null && DBUtils.DataToString(condition["status"]) != "")
                    {
                        sbInString.Append(" and a.status = '" + DBUtils.DataToString(condition["status"]) + "' ");
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
    }
}
