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
    public class RoleMenuAuth : Gentity
    {
        public decimal? menu_no;
        public string menu_name;
        public decimal? parent_menu_no;
        public List<RoleMenuAuth> children;
        public string auth;
        public decimal? depth;
        public decimal? output_order;
        public string use_yn;
        public string del_yn;
        public string path;
        public string icon;
        public string component;
        public string iconCls;
        public string text;
        public string id;
        public string role_no;
        public string auth_type;

        public bool leaf
        {
            get
            {
                if (this.children != null && this.children.Count > 0)
                    return false;
                else
                    return true;
            }
        }

        public bool readable
        {
            get
            {
                if (this.auth != null && (this.auth == "D" || this.auth == "W" || this.auth == "R"))
                    return true;
                else
                    return false;
            }
        }
        public RoleMenuAuth()
        { }
        public RoleMenuAuth(Hashtable dr)
        {
            this.menu_no = DBUtils.DataToDecimal(dr["menu_no"]);
            this.menu_name = DBUtils.DataToString(dr["menu_name"]);
            this.path = DBUtils.DataToString(dr["path"]);
            this.parent_menu_no = DBUtils.DataToDecimal(dr["parent_menu_no"]);
            this.depth = DBUtils.DataToDecimal(dr["depth"]);
            this.output_order = DBUtils.DataToDecimal(dr["output_order"]);
            this.use_yn = DBUtils.DataToString(dr["use_yn"]);
            this.del_yn = DBUtils.DataToString(dr["del_yn"]);
            this.auth = DBUtils.DataToString(dr["auth"]);
            this.icon = DBUtils.DataToString(dr["icon"]);
            this.iconCls = DBUtils.DataToString(dr["icon"]);
            this.component = DBUtils.DataToString(dr["component"]);
            this.text = DBUtils.DataToString(dr["menu_name"]);
            this.id = DBUtils.DataToString(dr["path"]);
            this.role_no = DBUtils.DataToString(dr["role_no"]);
            this.auth_type = DBUtils.DataToString(dr["auth_type"]);
        }

        internal IEnumerable<RoleMenuAuth> GetList(Hashtable condition)
        {
          try
          {
              var data = new Hashtable();
              List<RoleMenuAuth> list = new List<RoleMenuAuth>();
              using (var DB = Config.GetDatabase())
              {
                    var sql = DB.GetQuery("role_menu_auth", "GetList", condition);
                    StringBuilder sbInString = new StringBuilder();
                    String in_limit = "";
                    sbInString.Append("");

                    if(condition["searchtxt"] != null && DBUtils.DataToString(condition["searchtxt"]) != "")
                    {
                        sbInString.Append(" and (type_name like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or type_code like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%' ");
                        sbInString.Append(" or type_data like '%" + DBUtils.DataToString(condition["searchtxt"]) + "%') ");
                    }
                    if (condition["use_yn"] != null && DBUtils.DataToString(condition["use_yn"]) != "")
                    {
                        sbInString.Append(" and use_yn = '" + DBUtils.DataToString(condition["use_yn"]) + "' ");
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
                    if (!(condition["role_no"] == null || DBUtils.DataToString(condition["role_no"]) == ""))
                    {
                        var dt = DB.GetDataTable(sql, condition);
                        foreach (var dr in dt)
                        {
                            // parent가 기존 메뉴 트리에 있는 지 확인하고
                            // 없으면 루트에
                            // 있으면 그놈 아래에 추가해주자.
                            RoleMenuAuth rolemenuauth = new RoleMenuAuth(dr);

                            RoleMenuAuth parent = FindParent(list, rolemenuauth.parent_menu_no);

                            if (parent == null)
                            {
                                list.Add(rolemenuauth);
                            }
                            else
                            {
                                if (parent.children == null)
                                    parent.children = new List<RoleMenuAuth>();

                                parent.children.Add(rolemenuauth);
                            }
                        }
                    }
                }

                RemoveUnauthed(list);
                RemoveBlankMenuDir(list);

                return list;
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
                    var sql = DB.GetQuery("role_menu_auth", "GetComboList", condition);

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

        private void RemoveBlankMenuDir(List<RoleMenuAuth> menus)
        {
            for (int i = menus.Count - 1; i >= 0; i--)
            {
                var menu = menus[i];

                if (menu.leaf == false || string.IsNullOrWhiteSpace(menu.path) == true)
                {
                    if (CheckMenuExist(menu) == false)
                    {
                        menus.Remove(menu);
                    }
                    else
                    {
                        RemoveBlankMenuDir(menu.children);
                    }
                }
            }
        }

        private static bool CheckMenuExist(RoleMenuAuth menu)
        {
            if (string.IsNullOrWhiteSpace(menu.path) == false)
                return true;

            if (menu.children != null)
            {
                foreach (var m in menu.children)
                {
                    var r = CheckMenuExist(m);

                    if (r == true)
                    {
                        return r;
                    }
                }
            }

            return false;
        }

        private void RemoveUnauthed(List<RoleMenuAuth> rolemenuauth)
        {
            //먼저 권한이 없는 children들을 날려준다 leaf 인 것들 중에 menu_path 가 있는 놈들
            for (int i = rolemenuauth.Count - 1; i >= 0; i--)
            {
                var menu = rolemenuauth[i];

                if (menu.leaf == true)
                {
                    if (menu.readable == false)
                    {
                        rolemenuauth.Remove(menu);
                    }
                }
                else
                {
                    RemoveUnauthed(menu.children);
                }
            }
        }

        private RoleMenuAuth FindParent(List<RoleMenuAuth> rolemenuauthList, decimal? parent_menu_no)
        {
            foreach (var m in rolemenuauthList)
            {
                if (m.menu_no == parent_menu_no)
                {
                    return m;
                }
                else
                {
                    if (m.children != null && m.children.Count > 0)
                    {
                        var finded = FindParent(m.children, parent_menu_no);

                        if (finded != null)
                            return finded;
                    }
                }
            }

            return null;
        }

    }
}
