using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace GAPI.Common
{
    public static class StringUtils
    {

        public static string SplitCamelCase(string str)
        {
            return Regex.Replace(
                Regex.Replace(
                    str,
                    @"(\P{Ll})(\P{Ll}\p{Ll})",
                    "$1_$2"
                ),
                @"(\p{Ll})(\P{Ll})",
                "$1_$2"
            );
        }

        public static Boolean IsNullOrEmptyAnd(params String[] values)
        {
            if (values == null)
            {
                return true;
            }

            foreach (String value in values)
            {
                if (String.IsNullOrEmpty(value) == false)
                {
                    return false;
                }
            }

            return true;
        }

        public static Boolean IsNullOrEmptyOr(params String[] values)
        {
            if (values == null)
            {
                return true;
            }

            foreach (String value in values)
            {
                if (String.IsNullOrEmpty(value) == true)
                {
                    return true;
                }
            }

            return false;
        }

        public static Boolean IsNullOrWhiteSpaceAnd(params String[] values)
        {
            if (values == null)
            {
                return true;
            }

            foreach (String value in values)
            {
                if (String.IsNullOrWhiteSpace(value) == false)
                {
                    return false;
                }
            }

            return true;
        }

        public static Boolean IsNullOrWhiteSpaceOr(params String[] values)
        {
            if (values == null)
            {
                return true;
            }

            foreach (String value in values)
            {
                if (String.IsNullOrWhiteSpace(value) == true)
                {
                    return true;
                }
            }

            return false;
        }

        public static Boolean EqualsAnd(String source, params String[] values)
        {
            if (values == null)
            {
                throw new ArgumentNullException("Values is Null");
            }

            foreach (String value in values)
            {
                if (source.Equals(value) == false)
                {
                    return false;
                }
            }
            return true;
        }

        public static Boolean EqualsOr(String source, params String[] values)
        {
            if (values == null)
            {
                throw new ArgumentNullException("Values is Null");
            }

            foreach (String value in values)
            {
                if (source.Equals(value) == true)
                {
                    return true;
                }
            }
            return false;
        }

        public static Boolean StartsWithAnd(String source, params String[] values)
        {
            if (values == null)
            {
                throw new ArgumentNullException("Values is Null");
            }

            foreach (String value in values)
            {
                if (source.StartsWith(value) == false)
                {
                    return false;
                }
            }
            return true;
        }

        public static Boolean StartsWithOr(String source, params String[] values)
        {
            if (values == null)
            {
                throw new ArgumentNullException("Values is Null");
            }

            foreach (String value in values)
            {
                if (source.StartsWith(value) == true)
                {
                    return true;
                }
            }
            return false;
        }

        public static Boolean EndsWithAnd(String source, params String[] values)
        {
            if (values == null)
            {
                throw new ArgumentNullException("Values is Null");
            }

            foreach (String value in values)
            {
                if (source.EndsWith(value) == false)
                {
                    return false;
                }
            }
            return true;
        }

        public static Boolean EndsWithOr(String source, params String[] values)
        {
            if (values == null)
            {
                throw new ArgumentNullException("Values is Null");
            }

            foreach (String value in values)
            {
                if (source.EndsWith(value) == true)
                {
                    return true;
                }
            }
            return false;
        }

        public static String ReplaceEscapeChar(string readed)
        {
            return readed.Replace("\\n", "\n").Replace("\\r", "\r").Replace("\\t", "\t");
        }
    }
}
