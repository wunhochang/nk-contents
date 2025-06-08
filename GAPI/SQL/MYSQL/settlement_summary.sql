-- [GetList]
select
	data.*,
	fn_get_common_type_data('SETTLEMENT_PROCESS_TYPE', data.status) as status_name,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name,
	fn_get_user_name_by_no(data.confirm_user_no) as confirm_user_no_name
from (
select 
	  a.settlement_summary_no
	, a.settlement_type_no
	, a.service_corp_no
	, a.settlement_title
	, a.settlement_date
	, a.status
	, a.base_price
	, a.apply_type
	, a.discout_type
	, a.discount_rate
	, a.settlement_count
	, a.cancel_count
	, a.discount_price
	, a.total_amount
	, a.settlement_price
	, a.use_yn
	, a.insert_date
	, a.insert_user_no
	, a.update_date
	, a.update_user_no
	, a.confirm_date
	, a.confirm_user_no
	, b.settlement_type_name
	, c.service_corp_code
	, c.service_corp_name
	, c.manager_name
	, c.manager_tel
	, c.manager_email
	, (select 
		count(*) 
		from settlement_summary a 
		left join settlement_type b 
		on a.settlement_type_no = b.settlement_type_no
		left join service_corp c 
		on a.service_corp_no = c.service_corp_no
		where 1=1 and a.del_yn='N' {IN_STR}) as total_count
from settlement_summary a 
left join settlement_type b 
on a.settlement_type_no = b.settlement_type_no
left join service_corp c 
on a.service_corp_no = c.service_corp_no
where 1=1 and a.del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [Insert]
insert into settlement_summary(
	  settlement_summary_no
	, settlement_type_no
	, service_corp_no
	, settlement_date
	, settlement_title
	, status
	, base_price
	, apply_type
	, discout_type
	, discount_rate
	, settlement_count
	, cancel_count
	, discount_price
	, total_amount
	, settlement_price
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
)
values(
	  :settlement_summary_no
	, :settlement_type_no
	, :service_corp_no
	, :settlement_date
	, :settlement_title
	, :status /*A:등록, B:검증완료, C:마감완료*/
	, :base_price
	, :apply_type
	, :discout_type
	, :discount_rate
	, :settlement_count
	, :cancel_count
	, :discount_price
	, :total_amount
	, :settlement_price
	, current_timestamp
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
);

-- [Update]
update settlement_summary set
	  settlement_type_no= :settlement_type_no
	, service_corp_no	= :service_corp_no
	, settlement_date	= :settlement_date
	, settlement_title	= :settlement_title
	, status			= :status /*A:등록, B:검증완료, C:마감완료*/
	, base_price		= :base_price
	, apply_type		= :apply_type
	, discout_type		= :discout_type
	, discount_rate		= :discount_rate
	, settlement_count	= :settlement_count
	, cancel_count		= :cancel_count
	, discount_price	= :discount_price
	, total_amount		= :total_amount
	, settlement_price	= :settlement_price
	, update_date		= :current_timestamp
	, update_user_no	= :oper_user_no
where common_code_no = :settlement_summary_no
;

-- [Delete]
update settlement_summary set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where settlement_summary_no = :settlement_summary_no
;