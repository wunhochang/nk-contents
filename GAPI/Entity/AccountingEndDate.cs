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
    public class AccountingEndDate : Gentity
    {
      internal static void GetTop1List(Hashtable condition, ref APIResult result)
      {
          try
          {
              var data = new Hashtable();
              using (var DB = Config.GetDatabase())
              {
                    var sql = DB.GetQuery("accounting_end_date", "GetTop1List", condition);
                    var dt = DB.GetDataTable(sql, condition);

                    if (dt != null && dt.Count > 0)
                    {
                        result.Data = dt;
                        result.Success = true;
                        result.count = 1;
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

    internal static void CheckEndDate(Hashtable condition, ref APIResult result)
    {
        try
        {
            var data = new Hashtable();
            using (var DB = Config.GetDatabase())
            {
                var sql = DB.GetQuery("accounting_end_date", "check_end_date", condition);
                var dt = DB.GetDataTable(sql, condition);

                if (dt != null && dt.Count > 0)
                {
                    result.Data = dt;
                    result.Success = true;
                    result.count = 1;
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
