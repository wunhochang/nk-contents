using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Primitives;
using System.Security.Principal;
using GAPI.Common;
using System.Collections;

namespace GAPI.Entity
{
    public class Controler : Gentity
    {
        internal decimal? GetControllerNoByName(string controller_name)
        {
            try
            {
                var data = new Hashtable();
                data.Add("controller_name", controller_name);

                using (var DB = Config.GetDatabase())
                {
                    var dt = DB.GetDataTable(table_name, "GetControllerNoByName", data);

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