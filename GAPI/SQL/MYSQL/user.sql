-- [GetList]
select
	data.*,
	fn_get_common_type_data('USER_CONFIRM_YN', data.confirm_yn) as confirm_yn_name,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
	  a.user_no
	, a.user_id
	, a.user_name
	, a.user_type
	, a.user_tel
	, a.user_email
	, a.dept_no
	, a.output_order
	, a.use_yn
	, a.confirm_yn
	, a.insert_user_no
	, a.insert_date 
	, a.update_user_no
	, a.update_date 
	, b.role_name
	, a.role_no
	, (select count(*) from user a left join role b on a.role_no = b.role_no where 1=1 and a.del_yn='N' {IN_STR}) as total_count
from user a 
left join role b 
on a.role_no = b.role_no
where 1=1 and a.del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [ID_Check]
select 
	count(*) as cnt
from user
where user_id = :user_id;


-- [Mail_Check]
select 
	type_data
from common_code
where type_name = :type_name;

-- [Info]
SELECT user_no,
       user_id,
       user_pwd,
       user_name,
       user_type,
       dept_no,
	   role_no,
	   ifnull(user_tel,'') as user_tel,
	   ifnull(user_email,'') as user_email,
       output_order,
       use_yn,
       del_yn,
       insert_user_no,
       insert_date,
       update_user_no,
       update_date,
       delete_user_no,
       delete_date 
FROM user
WHERE user_id = :user_id
;

-- [GetUserNoByID]
SELECT user_no,
       user_id,
       user_pwd,
       user_name,
       user_type,
	   role_no,
	   ifnull(user_tel,'') as user_tel,
	   ifnull(user_email,'') as user_email,
       ifnull(dept_no,'') AS dept_no,
       output_order,
       use_yn,
       del_yn,
       insert_user_no,
       insert_date,
       update_user_no,
       update_date,
       delete_user_no,
       delete_date 
FROM user
WHERE user_id = :user_id
;

-- [List]
SELECT user_no,
       user_id,
       user_pwd,
       user_name,
       user_type,
	   role_no,
	   ifnull(user_tel,'') as user_tel,
	   ifnull(user_email,'') as user_email,
       ifnull(dept_no,'') AS dept_no,
       output_order,
       use_yn,
       del_yn,
       insert_user_no,
       insert_date,
       update_user_no,
       update_date,
       delete_user_no,
       delete_date 
FROM user
WHERE use_yn = (CASE WHEN :use_yn IS NULL OR :use_yn = '' THEN 'Y' ELSE :use_yn  END)
  AND del_yn = 'N'
  AND  CASE
             WHEN :user_no IS NULL OR :user_no = '' THEN 1
             ELSE user_no = :user_no
          END
ORDER BY user_no DESC
;

-- [Insert]
INSERT INTO user(
	user_no,
	user_id,
	user_pwd,
	user_name,
	user_type,
	user_tel,
	user_email,
	confirm_yn,
	role_no,
	dept_no,
	insert_user_no
)
VALUES (
	:user_no,
	:user_id,
	:user_pwd,
	:user_name,
	:user_type,
	:user_tel,
	:user_email,
	ifnull(:confirm_yn,'N'),
	:role_no,
	:dept_no,
	:oper_user_no
);

--[Update]
UPDATE user SET 
      user_name = :user_name
	, user_tel = :user_tel
	, user_email = :user_email
	, confirm_yn = :confirm_yn
	, role_no = :role_no
	, update_user_no = :oper_user_no
	, update_date = SYSDATE()
WHERE USER_NO = :USER_NO;

--[UserUpdate]
UPDATE user SET 
      user_name = :user_name
	, user_pwd = :user_pwd
	, user_tel = :user_tel
	, user_email = :user_email
	, confirm_yn = :confirm_yn
	, role_no = :role_no
	, update_user_no = :oper_user_no
	, update_date = SYSDATE()
WHERE USER_NO = :USER_NO;

--[Delete]
UPDATE user SET 
	USE_YN = 'N', 
	DEL_YN='Y', 
	DELETE_USER_NO = :oper_user_no, 
	DELETE_DATE = SYSDATE() 
WHERE user_no = :user_no;

-- [InitPasswd]
UPDATE user SET 
      user_pwd = :user_pwd
	, update_user_no = :oper_user_no
	, update_date = SYSDATE()
WHERE USER_NO = :USER_NO;

-- [DeleteMulti]
UPDATE user
SET 
	use_yn           = 'N',
    del_yn           = 'Y',
    delete_user_no   = :oper_user_no,
    delete_date  = current_timestamp
WHERE user_no in ({IN_STR})
;