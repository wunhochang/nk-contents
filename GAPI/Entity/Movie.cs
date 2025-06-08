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
    public class Movie : Gentity
    {
      internal static void GetList(Hashtable condition, ref APIResult result)
      {
          try
          {
              var data = new Hashtable();
              using (var DB = Config.GetDatabase())
              {
                    var sql = DB.GetQuery("movie", "GetList", condition);
                    StringBuilder sbInString = new StringBuilder();
                    String in_limit = "";
                    sbInString.Append("");

                    if(condition["searchtxt"] != null && DBUtils.DataToString(condition["searchtxt"]) != "")
                    {
                        sbInString.Append(" and (movie_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or publication_code like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or publication_kind_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%') ");
                    }
                    if (condition["use_yn"] != null && DBUtils.DataToString(condition["use_yn"]) != "")
                    {
                        sbInString.Append(" and use_yn = '" + DBUtils.DataToString(condition["use_yn"]) + "' ");
                    }
                    if (condition["cp_corp_no"] != null && DBUtils.DataToString(condition["cp_corp_no"]) != "")
                    {
                        sbInString.Append(" and cp_corp_no = '" + DBUtils.DataToString(condition["cp_corp_no"]) + "' ");
                    }
                    if (condition["cp_corp_detail_no"] != null && DBUtils.DataToString(condition["cp_corp_detail_no"]) != "")
                    {
                        sbInString.Append(" and cp_corp_detail_no = '" + DBUtils.DataToString(condition["cp_corp_detail_no"]) + "' ");
                    }
                    if (condition["sp_corp_no"] != null && DBUtils.DataToString(condition["sp_corp_no"]) != "")
                    {
                        sbInString.Append(" and sp_corp_no = '" + DBUtils.DataToString(condition["sp_corp_no"]) + "' ");
                    }
                    if (condition["movie_gubun"] != null && DBUtils.DataToString(condition["movie_gubun"]) != "")
                    {
                        sbInString.Append(" and movie_gubun = '" + DBUtils.DataToString(condition["movie_gubun"]) + "' ");
                    }
                    if (condition["pink_movie_yn"] != null && DBUtils.DataToString(condition["pink_movie_yn"]) != "")
                    {
                        sbInString.Append(" and pink_movie_yn = '" + DBUtils.DataToString(condition["pink_movie_yn"]) + "' ");
                    }
                    if (condition["mg_yn"] != null && DBUtils.DataToString(condition["mg_yn"]) != "")
                    {
                        sbInString.Append(" and mg_yn = '" + DBUtils.DataToString(condition["mg_yn"]) + "' ");
                    }
                    if (condition["service_type"] != null && DBUtils.DataToString(condition["service_type"]) != "")
                    {
                        sbInString.Append(" and service_type = '" + DBUtils.DataToString(condition["service_type"]) + "' ");
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
                    var sql = DB.GetQuery("movie", "GetComboList", condition);

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

        internal static void GetComboList2(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    var sql = DB.GetQuery("movie", "GetComboList2", condition);

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
