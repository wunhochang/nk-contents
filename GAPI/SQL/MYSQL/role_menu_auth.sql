-- [GetList]
select 
	   a.menu_no,
       a.menu_code,
       a.menu_name,
	   a.path,
       a.parent_menu_no,
       a.component,
       a.icon,
       a.depth,
       a.output_order,
       a.use_yn,
       a.del_yn,
       a.insert_user_no,
       a.insert_date,
       a.update_user_no,
       a.update_date,
       /*get_menu_auth(:user_id, a.menu_no) auth*/
	   'R' as auth,
	   ifnull(b.role_no,0) as role_no,
	   (case when ifnull(b.auth_type, 'X') = 'Y' then 'true' else 'false' end) as auth_type
from menu a 
left join role_menu_auth b 
on a.menu_no=b.menu_no
  and b.role_no = :role_no
where a.use_yn = 'Y' 
	and a.del_yn = 'N'
order by a.depth asc, a.output_order asc  ;

-- [Insert]
insert into role_menu_auth(
	  role_no
	, menu_no
	, auth_type
)
values(
	  :role_no
	, :menu_no
	, :auth_type
);


-- [Delete]
delete from role_menu_auth
where role_no = :role_no 
;