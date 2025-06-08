-- [GetList]
select 
	  sp_corp_manager_no
	, sp_corp_no
	, sp_corp_manager_name
	, sp_corp_manager_position
	, sp_corp_manager_tel1
	, sp_corp_manager_tel2
	, sp_corp_manager_email
	, output_order
	, use_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
from sp_corp_manager
where 1=1 
	and del_yn = 'N' 
	and sp_corp_no = :sp_corp_no
order by output_order asc, sp_corp_manager_name asc
;

-- [Insert]
insert into sp_corp_manager(
	  sp_corp_manager_no
	, sp_corp_no
	, sp_corp_manager_name
	, sp_corp_manager_position
	, sp_corp_manager_tel1
	, sp_corp_manager_tel2
	, sp_corp_manager_email
	, output_order
	, use_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :sp_corp_manager_no
	, :sp_corp_no
	, :sp_corp_manager_name
	, :sp_corp_manager_position
	, :sp_corp_manager_tel1
	, :sp_corp_manager_tel2
	, :sp_corp_manager_email
	, :output_order
	, :use_yn
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update sp_corp_manager set
	  sp_corp_no				= :sp_corp_no                     
	, sp_corp_manager_name		= :sp_corp_manager_name           
	, sp_corp_manager_position	= :sp_corp_manager_position       
	, sp_corp_manager_tel1		= :sp_corp_manager_tel1           
	, sp_corp_manager_tel2		= :sp_corp_manager_tel2           
	, sp_corp_manager_email		= :sp_corp_manager_email          
	, output_order			= :output_order                   
	, use_yn				= :use_yn                         
	, update_user_no		= :oper_user_no                   
	, update_date			= current_timestamp  
where sp_corp_manager_no = :sp_corp_manager_no
;

-- [Delete]
update sp_corp_manager set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where sp_corp_manager_no = :sp_corp_manager_no
;