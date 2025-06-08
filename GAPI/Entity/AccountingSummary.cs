using GAPI.Common;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GAPI.Entity.Common;
using System.Data;
using System.Text;
using Serilog;

namespace GAPI.Entity
{
    public class AccountingSummary : Gentity
    {
      internal static void GetList(Hashtable condition, ref APIResult result)
      {
          try
          {
              var data = new Hashtable();
              using (var DB = Config.GetDatabase())
              {
                    var sql = DB.GetQuery("accounting_summary", "GetList", condition);
                    StringBuilder sbInString = new StringBuilder();
                    String in_limit = "";
                    sbInString.Append("");

                    if (condition["st_date"] != null 
                        && DBUtils.DataToString(condition["st_date"]) != ""
                        && condition["end_date"] != null
                        && DBUtils.DataToString(condition["end_date"]) != "")
                    {
                        sbInString.Append(" and a.settlement_date between '" + DBUtils.DataToString(condition["st_date"])  + "' and '" + DBUtils.DataToString(condition["end_date"]) + "' ");
                    }

                    if (condition["searchtxt"] != null && DBUtils.DataToString(condition["searchtxt"]) != "")
                    {
                        sbInString.Append(" and (a.settlement_title like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or b.sp_corp_detail_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or c.sp_corp_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%') ");
                    }
                    if (condition["use_yn"] != null && DBUtils.DataToString(condition["use_yn"]) != "")
                    {
                        sbInString.Append(" and a.use_yn = '" + DBUtils.DataToString(condition["use_yn"]) + "' ");
                    }
                    if (condition["status"] != null && DBUtils.DataToString(condition["status"]) != "")
                    {
                        sbInString.Append(" and a.status = '" + DBUtils.DataToString(condition["status"]) + "' ");
                    }
                    if (condition["accounting_type"] != null && DBUtils.DataToString(condition["accounting_type"]) != "")
                    {
                        sbInString.Append(" and a.accounting_type = '" + DBUtils.DataToString(condition["accounting_type"]) + "' ");
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


    internal static void GetInterSalesReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();

                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    StringBuilder sbInString1 = new StringBuilder();
                    StringBuilder sbInString2 = new StringBuilder();
                    sbInString.Append("");
                    sbInString1.Append("");
                    sbInString2.Append("");

                    string aa;
                    string bb;

                    DateTime dtaa;
                    DateTime dtbb;

                    string movieString = string.Empty;
                    
                    aa = condition["st_date1"].ToString();
                    bb = condition["dt_date1"].ToString();

                    dtaa = Convert.ToDateTime(aa);
                    dtbb = Convert.ToDateTime(bb);
                    int  i = 1;

                    
                    for(var date = dtaa; date<=dtbb ; date.AddMonths(1))
                    {   
                        Console.WriteLine(date.ToString("yyyy-MM-dd"));
                        sbInString2.Append(" , SUM(IF(settlement_date =  '" +date.ToString("yyyy-MM") + "' , accounting_price, 0)) AS col_"+i);
                        //, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
                        i++;
                        date = date.AddMonths(1);
                    }

                    // for(DateTime dtaa; dtbb.CompareTo(dtaa) > 0; dtaa.AddMonth(1))
                    // {
                    //     Console.WriteLine(dtaa.ToString("yyyy-MM"));
                    // }
                    // Console.WriteLine(dtaa.ToString("yyyy-MM"));

                    Console.WriteLine(sbInString2.ToString());

                    foreach(DictionaryEntry entry in condition){
                        // Console.WriteLine("{0} and {1} ", entry.Key, entry.Value);
                        if(entry.Key.ToString() == "movie_no")
                        {
                            movieString += "" + entry.Value + "";
                        }
                        
                    }
                    
                    string textc = movieString.Replace("[", "").Replace("]", "");

                    if (condition["movie_no"] != null && DBUtils.DataToString(condition["movie_no"]) != "" && DBUtils.DataToString(condition["movie_no"]) != "0")
                    {
                
                        sbInString.Append(" and b.movie_no in (" + DBUtils.DataToString(textc) + ") ");
                        sbInString1.Append(" and aa.movie_no in ( " + DBUtils.DataToString(textc) + " )");
                    }
                    if (condition["sp_corp_detail_no"] != null && DBUtils.DataToString(condition["sp_corp_detail_no"]) != "" && DBUtils.DataToString(condition["sp_corp_detail_no"]) != "0")
                    {
                        sbInString.Append(" and a.sp_corp_detail_no = '" + DBUtils.DataToString(condition["sp_corp_detail_no"]) + "' ");
                        sbInString1.Append(" and aa.sp_corp_detail_no = '" + DBUtils.DataToString(condition["sp_corp_detail_no"]) + "' ");
                    }
                    var sql = DB.GetQuery("accounting_summary", "GetInterSalesReport", condition);
                    sql = sql.Replace("{COL_STR}", sbInString2.ToString());
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());
                    sql = sql.Replace("{IN_STR1}", sbInString1.ToString());

                    Console.WriteLine(sql);
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


        internal static void GetTotalSalesReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    StringBuilder sbInString1 = new StringBuilder();
                    sbInString.Append("");
                    sbInString1.Append("");

                    string movieString = string.Empty;
                    
                   
                    foreach(DictionaryEntry entry in condition){
                        // Console.WriteLine("{0} and {1} ", entry.Key, entry.Value);
                        if(entry.Key.ToString() == "movie_no")
                        {
                            movieString += "" + entry.Value + "";
                        }
                        
                    }
                    
                    string textc = movieString.Replace("[", "").Replace("]", "");
                    if (condition["movie_no"] != null && DBUtils.DataToString(condition["movie_no"]) != "" && DBUtils.DataToString(condition["movie_no"]) != "0")
                    {
                        sbInString.Append(" and bb.movie_no in ( " + DBUtils.DataToString(textc) + ") ");
                       // sbInString1.Append(" and aa.movie_no in (" + DBUtils.DataToString(textc) + ") ");
                    }
                    if (condition["sp_corp_detail_no"] != null && DBUtils.DataToString(condition["sp_corp_detail_no"]) != "" && DBUtils.DataToString(condition["sp_corp_detail_no"]) != "0")
                    {
                        sbInString1.Append(" and bb.sp_corp_detail_no = '" + DBUtils.DataToString(condition["sp_corp_detail_no"]) + "' ");
                     //   sbInString1.Append(" and aa.sp_corp_detail_no = '" + DBUtils.DataToString(condition["sp_corp_detail_no"]) + "' ");
                    }
                    var sql = DB.GetQuery("accounting_summary", "GetTotalSalesReport", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());
                    sql = sql.Replace("{IN_STR1}", sbInString1.ToString());

                    Console.WriteLine(sql);
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

        
        internal static void GetMovieSalesReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    StringBuilder sbInString1 = new StringBuilder();
                    sbInString.Append("");

                    string movieString = string.Empty;
                    
                   
                    foreach(DictionaryEntry entry in condition){
                        // Console.WriteLine("{0} and {1} ", entry.Key, entry.Value);
                        if(entry.Key.ToString() == "movie_no")
                        {
                            movieString += "" + entry.Value + "";
                        }
                        
                    }
                    
                    string textc = movieString.Replace("[", "").Replace("]", "");
                    if (condition["movie_no"] != null && DBUtils.DataToString(condition["movie_no"]) != "" && DBUtils.DataToString(condition["movie_no"]) != "0")
                    {
                        sbInString.Append(" and b.movie_no in ( " + DBUtils.DataToString(textc) + ") ");
                        sbInString1.Append(" and a.movie_no in ( " + DBUtils.DataToString(textc) + ") ");
                    }
                    var sql = DB.GetQuery("accounting_summary", "GetMovieSalesReport", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());
                    sql = sql.Replace("{IN_STR1}", sbInString1.ToString());

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

        internal static void GetCorpSalesReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    StringBuilder sbInString1 = new StringBuilder();
                    StringBuilder sbInString2 = new StringBuilder();
                    StringBuilder sbInString5 = new StringBuilder();
                    sbInString.Append("");
                    sbInString1.Append("");
                    sbInString2.Append("");
                    sbInString5.Append("");
                    if (condition["sales_kind"] != null && DBUtils.DataToString(condition["sales_kind"]) != "" && DBUtils.DataToString(condition["sales_kind"]) != "0")
                    {
                        sbInString1.Append(" and b.type_code = '" + DBUtils.DataToString(condition["sales_kind"]) + "' ");
                        sbInString2.Append(" and b.sales_kind = '" + DBUtils.DataToString(condition["sales_kind"]) + "' ");
                        sbInString5.Append(" and a.sales_kind = '" + DBUtils.DataToString(condition["sales_kind"]) + "' ");
                    }
                    if (condition["sp_corp_detail_no"] != null && DBUtils.DataToString(condition["sp_corp_detail_no"]) != "" && DBUtils.DataToString(condition["sp_corp_detail_no"]) != "0")
                    {
                        sbInString.Append(" and a.sp_corp_detail_no = '" + DBUtils.DataToString(condition["sp_corp_detail_no"]) + "' ");
                        sbInString1.Append(" and c.sp_corp_detail_no = '" + DBUtils.DataToString(condition["sp_corp_detail_no"]) + "' ");
                    }
                    var sql = DB.GetQuery("accounting_summary", "GetCorpSalesReport", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());
                    sql = sql.Replace("{IN_STR1}", sbInString1.ToString());
                    sql = sql.Replace("{IN_STR2}", sbInString2.ToString());

                    sql = sql.Replace("{IN_STR5}", sbInString5.ToString());

                    Console.WriteLine("GetCorpSalesReport "+sql);
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


internal static void GetAnalSalesReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    StringBuilder sbInString1 = new StringBuilder();
                    StringBuilder sbInString2 = new StringBuilder();
                    StringBuilder sbInString3 = new StringBuilder();
                    StringBuilder sbInString4 = new StringBuilder();
                    StringBuilder sbInString5 = new StringBuilder();


                    sbInString.Append("");
                    sbInString1.Append("");
                    sbInString2.Append("");
                    sbInString3.Append("");
                    sbInString4.Append("");

                    string movieString = string.Empty;
                    string salesString = string.Empty;
                    foreach(DictionaryEntry entry in condition){
                        // Console.WriteLine("{0} and {1} ", entry.Key, entry.Value);
                        if(entry.Key.ToString() == "movie_no")
                        {
                            movieString += "" + entry.Value + "";
                        }
                        
                    }

                    foreach(DictionaryEntry entry in condition){
                         Console.WriteLine("{0} and {1} ", entry.Key, entry.Value);
                        if(entry.Key.ToString() == "sales_kind")
                        {
                            salesString += "" + entry.Value + "";
                        }
                        Console.WriteLine(salesString + "  test");
                    }
                    
                    if (condition["sp_corp_detail_no"] != null && DBUtils.DataToString(condition["sp_corp_detail_no"]) != "" && DBUtils.DataToString(condition["sp_corp_detail_no"]) != "0")
                    {
                        sbInString.Append(" and b.sp_corp_detail_no = '" + DBUtils.DataToString(condition["sp_corp_detail_no"]) + "' ");
                    }

                    string textc = movieString.Replace("[", "").Replace("]", "");
                    if (condition["movie_no"] != null && DBUtils.DataToString(condition["movie_no"]) != "" && DBUtils.DataToString(condition["movie_no"]) != "0")
                    {
                
                        sbInString2.Append(" and b.movie_no in (" + DBUtils.DataToString(textc) + ")  ");
                       // sbInString3.Append(" and b.movie_no in ( " + DBUtils.DataToString(textc) + " )  ");
                      //  sbInString4.Append(" where movie_name is not null  ");
                    }

                    string texts = salesString.Replace("[", "").Replace("]", "");
                    texts = texts.Replace("\"", "'");
                    if (condition["sales_kind"] != null && DBUtils.DataToString(condition["sales_kind"]) != "" && DBUtils.DataToString(condition["sales_kind"]) != "0")
                    {
                
                        sbInString3.Append(" and b.sales_kind in (" + DBUtils.DataToString(texts) + ")  ");
                       // sbInString3.Append(" and b.movie_no in ( " + DBUtils.DataToString(textc) + " )  ");
                      //  sbInString4.Append(" where movie_name is not null  ");
                    }

                    // if (condition["sales_kind"] != null && DBUtils.DataToString(condition["sales_kind"]) != "" && DBUtils.DataToString(condition["sales_kind"]) != "0")
                    // {
                    //     sbInString1.Append(" and b.sales_kind = '" + DBUtils.DataToString(condition["sales_kind"]) + "' ");
                    // }
                    // if (condition["sp_corp_detail_no"] != null && DBUtils.DataToString(condition["sp_corp_detail_no"]) != "" && DBUtils.DataToString(condition["sp_corp_detail_no"]) != "0")
                    // {
                    //     sbInString.Append(" and a.sp_corp_detail_no = '" + DBUtils.DataToString(condition["sp_corp_detail_no"]) + "' ");
                    //     sbInString1.Append(" and c.sp_corp_detail_no = '" + DBUtils.DataToString(condition["sp_corp_detail_no"]) + "' ");
                    // }
                    var sql = DB.GetQuery("accounting_summary", "GetAnalSalesReport", condition);

                    sql = sql.Replace("{IN_STR}", sbInString.ToString());

                    sql = sql.Replace("{IN_STR1}", sbInString1.ToString());
                    sql = sql.Replace("{MOVIE_STR}", sbInString2.ToString());
                    sql = sql.Replace("{SALESKIND_STR}", sbInString3.ToString());
                    // sql = sql.Replace("{MOVIE_STR2}", sbInString3.ToString());
                    // sql = sql.Replace("{MOVIE_STR4}", sbInString4.ToString());

                    Console.WriteLine(sql);
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

        internal static void GetReportAcount(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    StringBuilder sbInString1 = new StringBuilder();
                    sbInString.Append("");
                    if (condition["movie_no"] != null && DBUtils.DataToString(condition["movie_no"]) != "" && DBUtils.DataToString(condition["movie_no"]) != "0")
                    {
                        sbInString1.Append(" and a.movie_no = '" + DBUtils.DataToString(condition["movie_no"]) + "' ");
                    }
                    if (condition["sp_corp_no"] != null && DBUtils.DataToString(condition["sp_corp_no"]) != "" && DBUtils.DataToString(condition["sp_corp_no"]) != "0")
                    {
                        sbInString.Append(" and data.sp_corp_no = '" + DBUtils.DataToString(condition["sp_corp_no"]) + "' ");
                    }
                    var sql = DB.GetQuery("accounting_summary", "GetReportAcount", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());
                    sql = sql.Replace("{IN_STR1}", sbInString1.ToString());

                    Console.WriteLine("and {0} ", sql);
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


        internal static void GetRekuckSalesReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    StringBuilder sbInString1 = new StringBuilder();
                    sbInString.Append("");
                    if (condition["movie_no"] != null && DBUtils.DataToString(condition["movie_no"]) != "" && DBUtils.DataToString(condition["movie_no"]) != "0")
                    {
                        sbInString1.Append(" and a.movie_no = '" + DBUtils.DataToString(condition["movie_no"]) + "' ");
                    }
                    if (condition["sp_corp_no"] != null && DBUtils.DataToString(condition["sp_corp_no"]) != "" && DBUtils.DataToString(condition["sp_corp_no"]) != "0")
                    {
                        sbInString.Append(" and data.sp_corp_no = '" + DBUtils.DataToString(condition["sp_corp_no"]) + "' ");
                    }
                    var sql = DB.GetQuery("accounting_summary", "GetRekuckSalesReport", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());
                    sql = sql.Replace("{IN_STR1}", sbInString1.ToString());

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


        internal static void GetCpCorpSalesReport(Hashtable condition, ref APIResult result)
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
                    var sql = DB.GetQuery("accounting_summary", "GetCpCorpSalesReport", condition);
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

        internal static void GetPinkSalesReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    StringBuilder sbInString1 = new StringBuilder();
                    sbInString.Append("");
                    sbInString1.Append("");
                    if (condition["platform_type"] != null && DBUtils.DataToString(condition["platform_type"]) != "" && DBUtils.DataToString(condition["platform_type"]) != "0")
                    {
                        sbInString.Append(" and a.platform_type = '" + DBUtils.DataToString(condition["platform_type"]) + "' ");
                    }
                    if (condition["movie_no"] != null && DBUtils.DataToString(condition["movie_no"]) != "" && DBUtils.DataToString(condition["movie_no"]) != "0")
                    {
                        sbInString.Append(" and b.movie_no = '" + DBUtils.DataToString(condition["movie_no"]) + "' "); /*합계*/
                        sbInString1.Append(" and a.movie_no = '" + DBUtils.DataToString(condition["movie_no"]) + "' ");
                    }
                    var sql = DB.GetQuery("accounting_summary", "GetPinkSalesReport", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());
                    sql = sql.Replace("{IN_STR1}", sbInString1.ToString());

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

        internal static void GetRawSalesReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    StringBuilder sbInString1 = new StringBuilder();
                    sbInString.Append("");
                    sbInString1.Append("");
                    if (condition["movie_no"] != null && DBUtils.DataToString(condition["movie_no"]) != "" && DBUtils.DataToString(condition["movie_no"]) != "0")
                    {
                        sbInString.Append(" and a.movie_no = '" + DBUtils.DataToString(condition["movie_no"]) + "' ");
                        sbInString1.Append(" and b.movie_no = '" + DBUtils.DataToString(condition["movie_no"]) + "' ");
                    }
                    var sql = DB.GetQuery("accounting_summary", "GetRawSalesReport", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());
                    sql = sql.Replace("{IN_STR1}", sbInString1.ToString());

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

        internal static void GetAccountMailReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                var sql = "";
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    sbInString.Append("");
                    if (condition["cp_corp_no"] != null && DBUtils.DataToString(condition["cp_corp_no"]) != "" && DBUtils.DataToString(condition["cp_corp_no"]) != "0")
                    {
                        sbInString.Append(" and a.cp_corp_no = '" + DBUtils.DataToString(condition["cp_corp_no"]) + "' ");
                    }

                    if(condition["report_no"].ToString()=="102")
                    {
                        sql = DB.GetQuery("accounting_summary", "GetAccountMailReportRT02", condition);
                    }else{
                        sql = DB.GetQuery("accounting_summary", "GetAccountMailReport", condition);
                    }
                    //var sql = DB.GetQuery("accounting_summary", "GetAccountMailReport", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());

                    Console.WriteLine(sql);
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

        internal static void GetAccountMailReportRT02(Hashtable condition, ref APIResult result)
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
                    var sql = DB.GetQuery("accounting_summary", "GetAccountMailReportRT02", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());

                    Console.WriteLine(sql);
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

        internal static void GetAccountMailReportRawData(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                var sql = "";
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    sbInString.Append("");
                    if (condition["cp_corp_no"] != null && DBUtils.DataToString(condition["cp_corp_no"]) != "" && DBUtils.DataToString(condition["cp_corp_no"]) != "0")
                    {
                        sbInString.Append(" and a.cp_corp_no = '" + DBUtils.DataToString(condition["cp_corp_no"]) + "' ");
                    }

                    if(condition["report_no"].ToString()=="102"){
                        sql = DB.GetQuery("accounting_summary", "GetAccountMailReportRawDataRT02", condition);
                    }else{
                        sql = DB.GetQuery("accounting_summary", "GetAccountMailReportRawData", condition);
                    }
                    
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());

                    Console.WriteLine(sql);
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

        internal static void GetAccountMailReportRawDataRT02(Hashtable condition, ref APIResult result)
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
                    var sql = DB.GetQuery("accounting_summary", "GetAccountMailReportRawDataRT02", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());

                    Console.WriteLine(sql);
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


        internal static void GetBillingPaperReport(Hashtable condition, ref APIResult result)
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
                    var sql = DB.GetQuery("accounting_summary", "GetBillingPaperReport", condition);
                    sql = sql.Replace("{IN_STR}", sbInString.ToString());

                    Console.WriteLine(sql);
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


        internal static void GetRawBillingPaperReport(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();
                    sbInString.Append("");
                    if (condition["searchtxt"] != null && DBUtils.DataToString(condition["searchtxt"]) != "")
                    {
                        sbInString.Append(" and c.movie_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                    }
                    var sql = DB.GetQuery("accounting_summary", "GetRawBillingPaperReport", condition);
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

        internal static void GetTrendListFirst(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();

                    var st_date = int.Parse(condition["st_date"].ToString());
                    var dt_date = int.Parse(condition["dt_date"].ToString());
                    var i=1;

                    for(var syear = st_date; syear<=dt_date ; syear++)
                    {   
                       
                        sbInString.Append(" , SUM(IF(left(settlement_date,4) = cast(cast('"+syear+"' as SIGNED) as char(4)), accounting_price, 0)) AS salesamt_"+i);                        //, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
                        i++;
                    }


                    var sql = DB.GetQuery("main", "GetTrendListFirst", condition);
                    sql = sql.Replace("{COL_STR}", sbInString.ToString());

                    Console.WriteLine(sql);
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

        internal static void GetTrendListSecond(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    StringBuilder sbInString = new StringBuilder();

                    var st_date = int.Parse(condition["st_date"].ToString());
                    var dt_date = int.Parse(condition["dt_date"].ToString());
                    var i=1;

                    for(var syear = st_date; syear<=dt_date ; syear++)
                    {   
                       
                        sbInString.Append(" , SUM(IF(left(settlement_date,4) = cast(cast('"+syear+"' as SIGNED) as char(4)), accounting_price, 0)) AS salesamt_"+i);                        //, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
                        i++;
                    }


                    var sql = DB.GetQuery("main", "GetTrendListSecond", condition);
                    sql = sql.Replace("{COL_STR}", sbInString.ToString());

                    Console.WriteLine(sql);
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

        internal static void GetMovieTopList(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    var sql = DB.GetQuery("main", "GetMovieTop10", condition);
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
        internal static void GetSpCorpTopList(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    var sql = DB.GetQuery("main", "GetSpCorpTop10", condition);
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

        internal static void GetYearList(Hashtable condition, ref APIResult result)
        {
            try
            {
                var data = new Hashtable();
                using (var DB = Config.GetDatabase())
                {
                    var sql = DB.GetQuery("accounting_summary", "GetYearList", condition);
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
