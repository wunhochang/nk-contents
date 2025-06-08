-- [GetList]
select
	  a.accounting_rawdata_no
	, a.accounting_summary_no
	, a.sp_corp_detail_no
	, a.sp_sales_date
	, a.sp_cor_accounting_date
	, a.movie_tag_name
	, a.up_sp_corp_name
	, a.sales_price
	, a.accounting_rates
	, a.accounting_price
	, a.accounting_cp_price
	, a.movie_no
	, a.movie_check
	, a.tag_flag
	, a.output_order
	, a.sales_kind
	, a.sales_kind_name
	, a.distribution_enterprise_type
	, a.distribution_enterprise_type_name
	, a.accounting_type
	, a.contract_st_date
	, a.contract_ed_date
	, (case when a.monopoly_yn = 'Y' then 'true' else 'flase' end) as monopoly_yn
	, a.degree
	, a.raw_nk_price
	, a.raw_monitor_price
	, a.raw_price
	, a.verify_yn
	, a.confirm_yn
	, a.use_yn
	, a.del_yn
	, a.insert_user_no
	, a.insert_date
	, a.update_user_no
	, a.update_date
	, b.movie_name
from accounting_rawdata a left join movie b on a.movie_no = b.movie_no
where 1=1 
	and a.del_yn = 'N'
    and a.use_yn = 'Y'
	and a.accounting_summary_no = :accounting_summary_no
order by a.output_order asc
;

-- [Insert]
insert into accounting_rawdata(
	  accounting_rawdata_no
	, accounting_summary_no
	, sp_corp_detail_no
	, sp_sales_date
	, sp_cor_accounting_date
	, movie_tag_name
	, up_sp_corp_name
	, sales_price
	, accounting_rates
	, accounting_price
	, accounting_cp_price
	, movie_no
	, movie_check
	, tag_flag
	, output_order
	, sales_kind
	, sales_kind_name
	, distribution_enterprise_type
	, distribution_enterprise_type_name
	, accounting_type
	, contract_st_date
	, contract_ed_date
	, nk_rate
	, cp_rate
	, monopoly_yn
	, degree
	, raw_nk_price
	, raw_monitor_price
	, raw_price
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
)
select
	  :accounting_rawdata_no
	, :accounting_summary_no
	, :sp_corp_detail_no
	, :sp_sales_date
	, :sp_cor_accounting_date
	, :movie_tag_name
	, :up_sp_corp_name
	, :sales_price
	, :accounting_rates
	, :accounting_price
	, :accounting_cp_price
	, :movie_no
	, :movie_check
	, :tag_flag
	, :output_order
	, :sales_kind
	, :sales_kind_name
	, :distribution_enterprise_type
	, :distribution_enterprise_type_name
	, :accounting_type
	, :contract_st_date
	, :contract_ed_date
	, :nk_rate
	, :cp_rate
	, (case when :monopoly_yn = true then 'Y' else 'N' end)
	, (select ifnull(max(degree),1) from accounting_rawdata where accounting_summary_no = :accounting_summary_no)
	, :raw_nk_price
	, :raw_monitor_price
	, :raw_price
	, current_timestamp
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
;

-- [Delete]
update accounting_rawdata set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where accounting_summary_no = :accounting_summary_no
	and use_yn = 'Y'
	and del_yn = 'N'
;