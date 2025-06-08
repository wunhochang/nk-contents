using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GAPI.Common
{
    public class DBUtils
    {
        internal static Decimal? DataToDecimal(object org_data, decimal? defaultValue = null)
        {
            //DBData data = org_data as DBData;

            //if (data == null)
            //    return defaultValue;

            Decimal result = 0;

            if(Decimal.TryParse(org_data.ToString(), out result))
            {
                return result;
            }
            else
            {
                return defaultValue;
            }
        }

        internal static string DataToString(object org_data)
        {
            //DBData data = org_data as DBData;

            //if (data == null)
            //    return null;

            return org_data.ToString();
        }

        internal static Boolean DataToBoolean(object org_data)
        {
            //DBData data = org_data as DBData;

            //if (data == null)
            //    return false;
            
            String str = DBUtils.DataToString(org_data);

            if (String.IsNullOrWhiteSpace(str) == false)
            {
                Boolean rValue = false;
                if (Boolean.TryParse(str, out rValue))
                {
                    return rValue;
                }
                else if (StringUtils.EqualsOr(str.ToUpper(), "Y", "YES", "TRUE", "1"))
                {
                    return true;
                }
                else if (StringUtils.EqualsOr(str.ToUpper(), "N", "NO", "FALSE", "0"))
                {
                    return false;
                }
            }
            else // 공백일때
            {
                return false;
            }

            throw new ArgumentException("\"" + str + "\" is Not Boolean");
        }

        internal static DateTime? DataToDate(object org_data, DateTime? defaultValue = null)
        {
            //DBData dbdata = org_data as DBData;

            //if (dbdata == null)
            //    return null;

            //var data = dbdata.Value;

            DateTime convertedValue = new DateTime();

            try
            {
                if (org_data == null || org_data.GetType() == typeof(DBNull))
                {
                    if (defaultValue == null)
                    {
                        return null;
                    }
                    else
                    {
                        return defaultValue;
                    }
                }
                else
                {
                    try
                    {
                        convertedValue = Convert.ToDateTime(org_data);

                        convertedValue = DateTime.ParseExact(convertedValue.ToString("yyyyMMdd"), "yyyyMMdd", null);

                    }
                    catch (Exception)
                    {
                        if (DateTime.TryParse(org_data.ToString(), out convertedValue) == false)
                        {
                            convertedValue = DateTime.ParseExact(org_data.ToString(), "yyyyMMdd", null);
                        }
                    }
                }

                return convertedValue;
            }
            catch
            {
                try
                {
                    convertedValue = DateTime.ParseExact(org_data.ToString(), "yyyy-MM-dd", null);
                }
                catch
                {
                    //return convertedValue;
                    return null;
                }

                return convertedValue;
            }
        }

        internal static DateTime? DataToDateTime(object org_data, DateTime? defaultValue = null)
        {
            //DBData dbdata = org_data as DBData;

            //if (dbdata == null)
            //    return null;

            //var data = dbdata.Value;

            DateTime convertedValue = new DateTime();

            try
            {
                if (org_data == null || org_data.GetType() == typeof(DBNull))
                {
                    if (defaultValue == null)
                    {
                        return null;
                    }
                    else
                    {
                        return defaultValue;
                    }
                }
                else
                {
                    try
                    {
                        convertedValue = Convert.ToDateTime(org_data);

                        convertedValue = DateTime.ParseExact(convertedValue.ToString("yyyyMMddHHmmss"), "yyyyMMddHHmmss", null);

                    }
                    catch (Exception)
                    {
                        if (DateTime.TryParse(org_data.ToString(), out convertedValue) == false)
                        {
                            convertedValue = DateTime.ParseExact(org_data.ToString(), "yyyyMMddHHmmss", null);
                        }
                    }
                }

                return convertedValue;
            }
            catch
            {
                try
                {
                    convertedValue = DateTime.ParseExact(org_data.ToString(), "yyyy-MM-dd HH:mm:ss", null);
                }
                catch
                {
                    //return convertedValue;
                    return null;
                }

                return convertedValue;
            }
        }
    }
}
