-- [GetList]
select
	data.*,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
  a.settlement_type_no,
  a.service_corp_no,
  a.settlement_type_name,
  a.use_yn,
  a.del_yn,
  a.start_col,
  a.start_row,
  a.start_sheet,
  a.insert_date,
  a.insert_user_no,
  a.update_date,
  a.update_user_no,
  a.delete_date,
  a.delete_user_no,
  b.service_corp_name,
  (select count(*) from settlement_type a left join service_corp b on a.service_corp_no = b.service_corp_no 
	where 1=1 and a.del_yn = 'N' {IN_STR}) as total_count
from settlement_type a left join service_corp b
on a.service_corp_no = b.service_corp_no
where 1=1 and a.del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetComboList]
select 
  a.settlement_type_no,
  a.service_corp_no,
  a.settlement_type_name,
  a.use_yn,
  a.del_yn,
  a.insert_date,
  a.insert_user_no,
  a.update_date,
  a.update_user_no,
  a.delete_date,
  a.delete_user_no,
  b.service_corp_name
from settlement_type a left join service_corp b
on a.service_corp_no = b.service_corp_no
where 1=1 and a.del_yn = 'N' and a.use_yn = 'Y'
{IN_STR}
order by b.service_corp_name asc, a.settlement_type_name asc
;

-- [Insert]
insert into settlement_type(
	  settlement_type_no
	, service_corp_no
	, settlement_type_name
	, use_yn
	, start_col
	, start_row
	, start_sheet
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
)
values(
	  :settlement_type_no
	, :service_corp_no
	, :settlement_type_name
	, :use_yn
	, :start_col
	, :start_row
	, :start_sheet
	, current_timestamp
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
);

-- [Update]
update settlement_type set
	  service_corp_no		= :service_corp_no     
	, settlement_type_name	= :settlement_type_name
	, use_yn				= :use_yn         
	, start_col				= :start_col
	, start_row				= :start_row
	, start_sheet			= :start_sheet
	, update_date			= current_timestamp    
	, update_user_no		= :oper_user_no    
where settlement_type_no = :settlement_type_no
;

-- [Delete]
update settlement_type set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where settlement_type_no = :settlement_type_no
;