-- [GetList]
select
	data.*,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
	  service_corp_no
	, service_corp_code
	, service_corp_name
	, manager_name
	, manager_tel
	, manager_email
	, use_yn
	/*, DATE_FORMAT(insert_date, "%Y-%m-%d %h:%i:%s") as insert_date*/
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
	, (select count(*) from service_corp where 1=1 and del_yn='N' {IN_STR}) as total_count
from service_corp
where 1=1 and del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetComboList]
select 
	  service_corp_no
	, service_corp_code
	, service_corp_name
	, use_yn
from service_corp
where 1=1 and del_yn = 'N'
	and use_yn = 'Y'
order by service_corp_name asc;

-- [Insert]
insert into service_corp(
	   service_corp_no
	 , service_corp_code
	 , service_corp_name
	 , manager_name
	 , manager_tel
	 , manager_email
	 , use_yn
	 , insert_date
	 , insert_user_no
	 , update_date
	 , update_user_no
 )
 values(
	   :service_corp_no
	 , :service_corp_code
	 , :service_corp_name
	 , :manager_name
	 , :manager_tel
	 , :manager_email
	 , :use_yn
	 , current_timestamp
	 , :oper_user_no
	 , current_timestamp
	 , :oper_user_no
 );
-- [GetDetail]
select
	   service_corp_no
	 , service_corp_code
	 , service_corp_name
	 , manager_name
	 , manager_tel
	 , manager_email
	 , use_yn
	 , insert_date
	 , insert_user_no
	 , update_date
	 , update_user_no
from service_corp
where service_corp_no = :service_corp_no
;

-- [Update]
update service_corp set
	   service_corp_code= :service_corp_code   
	 , service_corp_name= :service_corp_name   
	 , manager_name		= :manager_name        
	 , manager_tel		= :manager_tel         
	 , manager_email	= :manager_email       
	 , use_yn			= :use_yn              
	 , update_date		= current_timestamp    
	 , update_user_no	= :oper_user_no  
where service_corp_no = :service_corp_no
;

-- [Delete]
update service_corp set
	use_yn = 'N',
	del_yn = 'Y',
	delete_user_no = :oper_user_no,
	delete_date = current_timestamp
where service_corp_no = :service_corp_no
;

-- [GetComboList]
select
	   service_corp_no
	 , service_corp_code
	 , service_corp_name
	 , manager_name
	 , manager_tel
	 , manager_email
	 , use_yn
	 , insert_date
	 , insert_user_no
	 , update_date
	 , update_user_no
from service_corp
where use_yn = 'Y'
	and del_yn = 'N'
order by service_corp_name asc
;