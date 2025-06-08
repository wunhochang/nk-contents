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

namespace GAPI.Entity
{
    public class Client: Gentity
    {   
        internal decimal InsertTokenUniq(Hashtable data)
        {
            try
            {
                using (var DB = Config.GetDatabase())
                {
                    decimal id = 0;

                    //var exist = DB.GetDataTable(table_name, "InfoByToken", data);
                    
                    if(data.ContainsKey("client_no") == true)
                    {
                        var effected = DB.ExcuteSQL(table_name, "UpdateToken", data);

                        return effected;
                    }
                    else
                    {
                        id = DB.GetNextSeq(table_name);
                        data[table_name + "_no"] = id;

                        var effected = DB.ExcuteSQL(table_name, "Insert", data);
                    }

                    return id;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        
        internal decimal? GetClientNoByToken(string token)
        {
            try
            {
                var data = new Hashtable();
                data.Add("token", token);

                using (var DB = Config.GetDatabase())
                {
                    var dt = DB.GetDataTable(table_name, "GetClientNoByToken", data);

                    if (dt != null && dt.Count > 0)
                        return DBUtils.DataToDecimal(dt[0][0]);
                    else
                        return null;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }        

    }
}