-- [GetList]
select
*
from (
    select 
        a.cp_accounting_report_no
      , a.settlement_date
      , a.cp_corp_no
      , a.cp_corp_detail_no
      , a.movie_no
      , a.sales_price
      , a.accounting_rates
      , a.accounting_price
      , a.cp_pay_price
      , a.nk_pay_price
      , a.cp_contract_rate
      , a.nk_contract_rate
      , a.total_sales
      , a.total_pay_price
      , a.nk_sales
      , a.nkk_pay_price
      , a.remark
      , b.cp_corp_name
      , c.cp_corp_detail_name
      , d.movie_name
	  , d.publication_code
      , 1 as depth
	  , a.settlement_date as settlement_date1
    from cp_accounting_report a
    left join cp_corp b
    on a.cp_corp_no = b.cp_corp_no
      and b.del_yn = 'N'
    left join cp_corp_detail c
    on a.cp_corp_detail_no = c.cp_corp_detail_no
      and c.del_yn = 'N'
    left join movie d
    on a.movie_no = d.movie_no
    where 1=1
      and a.use_yn = 'Y'
      and a.del_yn = 'N'
      and a.settlement_date between :st_date and :ed_date
	  {IN_STR}
    union all
    select
        0 as cp_accounting_report_no
      , '' as settlement_date
      , 0 as cp_corp_no
      , 0 as cp_corp_detail_no
      , 0 as movie_no
      , sales_price
      , accounting_rates
      , accounting_price
      , cp_pay_price
      , nk_pay_price
      , cp_contract_rate
      , nk_contract_rate
      , total_sales
      , total_pay_price
      , nk_sales
      , nkk_pay_price
      , '' as remark
      , '' as cp_corp_name
      , '합계' as cp_corp_detail_name
      , '' as movie_name
	  , '' as publication_code
      , 2 as depth
	  , settlement_date as settlement_date1
    from (
    select 
        a.settlement_date
      , a.cp_corp_no
      , sum(ifnull(a.sales_price,0)) as sales_price
      , sum(ifnull(a.accounting_rates,0)) as accounting_rates
      , sum(ifnull(a.accounting_price,0)) as accounting_price
      , sum(ifnull(a.cp_pay_price,0)) as cp_pay_price
      , sum(ifnull(a.nk_pay_price,0)) as nk_pay_price
      , max(a.cp_contract_rate) as cp_contract_rate
      , max(a.nk_contract_rate) as nk_contract_rate
      , sum(ifnull(a.total_sales,0)) total_sales
      , sum(ifnull(a.total_pay_price,0)) total_pay_price
      , sum(ifnull(a.nk_sales,0)) nk_sales
      , sum(ifnull(a.nkk_pay_price,0)) nkk_pay_price
    from cp_accounting_report a
    where 1=1
      and a.use_yn = 'Y'
      and a.del_yn = 'N'
      and a.settlement_date between :st_date and :ed_date
	  {IN_STR}
   -- group by a.settlement_date
   --        , a.cp_corp_no
    )data
) alldta 
order by depth asc,settlement_date1 desc,  settlement_date desc, cp_corp_name asc, cp_corp_detail_name asc, movie_name asc
;


-- [GetComboList]
select
	  common_code_no
	, type_name
	, type_code
	, type_data
from common_code
where 1=1 and del_yn = 'N' and use_yn = 'Y'
	and type_name = :type_name
order by output_order asc, type_data asc
;

-- [Insert]
insert into cp_accounting_report(
	  cp_accounting_report_no
	, settlement_date
	, cp_corp_no
	, cp_corp_detail_no
  , sp_corp_detail_no
	, movie_no
	, sales_price
	, accounting_rates
	, accounting_price
	, cp_pay_price
	, nk_pay_price
	, cp_contract_rate
	, nk_contract_rate
	, remark
  , total_sales
  , total_pay_price
  , nk_sales
  , nkk_pay_price
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :cp_accounting_report_no
	, :settlement_date
	, :cp_corp_no
	, :cp_corp_detail_no
  , :sp_corp_detail_no
	, :movie_no
	, :sales_price
	, :accounting_rates
	, :accounting_price
	, :cp_pay_price
	, :nk_pay_price
	, :cp_contract_rate
	, :nk_contract_rate
	, :remark
  , :total_sales
  , :total_pay_price
  , :nk_sales
  , :nkk_pay_price
	, :oper_user_no
	, sysdate()
	, :oper_user_no
	, sysdate()
);

-- [Update]
update cp_accounting_report set
	  settlement_date	= :settlement_date   
	, cp_corp_no		= :cp_corp_no        
	, cp_corp_detail_no	= :cp_corp_detail_no 
	, movie_no			= :movie_no          
	, sales_price		= :sales_price       
	, accounting_rates	= :accounting_rates  
	, accounting_price	= :accounting_price  
	, cp_pay_price		= :cp_pay_price      
	, nk_pay_price		= :nk_pay_price      
	, cp_contract_rate	= :cp_contract_rate             
	, nk_contract_rate	= :nk_contract_rate   
  , total_sales	= :total_sales  
	, total_pay_price	= :total_pay_price  
  , nk_sales	= :nk_sales  
	, nkk_pay_price	= :nkk_pay_price            
	, remark			= :remark            
	, update_user_no	= :oper_user_no      
	, update_date		= sysdate()   
where cp_accounting_report_no = :cp_accounting_report_no 
;

-- [Delete]
update cp_accounting_report set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where cp_accounting_report_no = :cp_accounting_report_no
;

-- [CpConfirm]
insert into cp_accounts_end_info(
	  settlement_date
	, cp_corp_detail_no
)
values(
	  :st_date
	, :cp_corp_detail_no
);

-- [CpConfirm_bak20170921]
update accounting_rawdata set
    cp_confirm_yn = 'Y'
  , update_user_no = :oper_user_no
  , update_date = sysdate()
where sp_cor_accounting_date = :st_date
  and movie_no in (select
  movie_no
from movie
where cp_corp_no = :cp_corp_no
  and use_yn  ='Y'
  and del_yn = 'N')
  and sp_corp_detail_no in( select sp_corp_detail_no from cp_to_sp_corp_group a inner join sp_corp_detail b
 on a.sp_corp_no = b.sp_corp_no
 where a.cp_corp_no = :cp_corp_no)
;

-- [GetCpAccountingReport]
select
*
from (
    select
        alldata.*
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
      , 1 as depth
      , cp_corp_name as cp_corp_name1
    from (
        select
          rdata.*
          , ifnull((
            select sum(aa.cp_pay_price) from  cp_accounting_report aa
            where 1=1
              and aa.use_yn = 'Y'
              and aa.del_yn = 'N'
              and aa.settlement_date < concat(:st_date,'-01')
              and aa.cp_corp_no = rdata.cp_corp_no
          ),0) as add_sale_price
        from (
          select
              cp_corp_no
            , cp_corp_name
            , cp_corp_detail_no
            , cp_corp_detail_name
            , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), cp_pay_price, 0)) AS col_1
            , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), cp_pay_price, 0)) AS col_2
            , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), cp_pay_price, 0)) AS col_3
            , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), cp_pay_price, 0)) AS col_4
            , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), cp_pay_price, 0)) AS col_5
            , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), cp_pay_price, 0)) AS col_6
            , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), cp_pay_price, 0)) AS col_7
            , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), cp_pay_price, 0)) AS col_8
            , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), cp_pay_price, 0)) AS col_9
            , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), cp_pay_price, 0)) AS col_10
            , SUM(IF(settlement_date = CONCAT(:st_date,'-011'), cp_pay_price, 0)) AS col_11
            , SUM(IF(settlement_date = CONCAT(:st_date,'-012'), cp_pay_price, 0)) AS col_12
            , SUM(cp_pay_price) as sub_tot_sum
          from (
          select
              a.cp_corp_no
            , a.cp_corp_name
            , b.cp_corp_detail_no
            , b.cp_corp_detail_name
            , c.settlement_date
            , sum(ifnull(c.sales_price,0)) as sales_price
            , max(ifnull(c.accounting_rates,0)) as accounting_rates
            , sum(ifnull(c.accounting_price,0)) as accounting_price
            , sum(ifnull(c.total_pay_price,c.cp_pay_price)) as cp_pay_price
            , sum(ifnull(c.nkk_pay_price,c.nk_pay_price)) as nk_pay_price
            , max(ifnull(c.total_sales,c.cp_contract_rate)) as cp_contract_rate
            , max(ifnull(c.nk_sales,c.nk_contract_rate)) as nk_contract_rate
          from cp_corp a 
          left join cp_corp_detail b
          on a.cp_corp_no = b.cp_corp_no
            and b.del_yn = 'N'
          left join cp_accounting_report c
          on b.cp_corp_no = c.cp_corp_no
            and b.cp_corp_detail_no = c.cp_corp_detail_no
            and c.use_yn = 'Y'
            and c.del_yn = 'N'
            and c.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
          where 1=1
		  {IN_STR}
          group by a.cp_corp_no
            , a.cp_corp_name
            , b.cp_corp_detail_no
            , b.cp_corp_detail_name
            , c.settlement_date 
          ) data  
          group by cp_corp_no
                , cp_corp_name
                , cp_corp_detail_no
                , cp_corp_detail_name
        ) rdata
    ) alldata
    union all
    select
        cp_corp_no
      , '' as cp_corp_name
      , 0 as cp_corp_detail_no
      , '총합계' as cp_corp_detail_name  
      , col_1
      , col_2
      , col_3
      , col_4
      , col_5
      , col_6
      , col_7
      , col_8
      , col_9
      , col_10
      , col_11
      , col_12
      , sub_tot_sum
      , add_sale_price
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
      , 2 as depth
      , cp_corp_name as cp_corp_name1
    from (
        select
          rdata.*
          , ifnull((
            select sum(aa.cp_pay_price) from  cp_accounting_report aa
            where 1=1
              and aa.use_yn = 'Y'
              and aa.del_yn = 'N'
              and aa.settlement_date < concat(:st_date,'-01')
              and aa.cp_corp_no = rdata.cp_corp_no
          ),0) as add_sale_price
        from (
          select
              cp_corp_no
            , cp_corp_name
            , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), cp_pay_price, 0)) AS col_1
            , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), cp_pay_price, 0)) AS col_2
            , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), cp_pay_price, 0)) AS col_3
            , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), cp_pay_price, 0)) AS col_4
            , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), cp_pay_price, 0)) AS col_5
            , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), cp_pay_price, 0)) AS col_6
            , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), cp_pay_price, 0)) AS col_7
            , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), cp_pay_price, 0)) AS col_8
            , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), cp_pay_price, 0)) AS col_9
            , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), cp_pay_price, 0)) AS col_10
            , SUM(IF(settlement_date = CONCAT(:st_date,'-011'), cp_pay_price, 0)) AS col_11
            , SUM(IF(settlement_date = CONCAT(:st_date,'-012'), cp_pay_price, 0)) AS col_12
            , SUM(cp_pay_price) as sub_tot_sum
          from (
          select
              a.cp_corp_no
            , a.cp_corp_name
            , c.settlement_date
            , sum(ifnull(c.sales_price,0)) as sales_price
            , max(ifnull(c.accounting_rates,0)) as accounting_rates
            , sum(ifnull(c.accounting_price,0)) as accounting_price
            , sum(ifnull(c.total_pay_price,c.cp_pay_price)) as cp_pay_price
            , sum(ifnull(c.nkk_pay_price,c.nk_pay_price)) as nk_pay_price
            , max(ifnull(c.total_sales,c.cp_contract_rate)) as cp_contract_rate
            , max(ifnull(c.nk_sales,c.nk_contract_rate)) as nk_contract_rate
          from cp_corp a 
          left join cp_corp_detail b
          on a.cp_corp_no = b.cp_corp_no
            and b.del_yn = 'N'
          left join cp_accounting_report c
          on b.cp_corp_no = c.cp_corp_no
            and b.cp_corp_detail_no = c.cp_corp_detail_no
            and c.use_yn = 'Y'
            and c.del_yn = 'N'
            and c.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
          where 1=1
		  {IN_STR}
          group by a.cp_corp_no
            , a.cp_corp_name
            , c.settlement_date 
          ) data  
          group by cp_corp_no
                , cp_corp_name
        ) rdata
    ) alldata
) tdata
order by cp_corp_name1 asc, depth asc, cp_corp_detail_name asc;


-- [CpCancel]
update cp_accounting_report set
  use_yn='N'
  , del_yn = 'Y'
  , delete_user_no = :oper_user_no
  , delete_date = sysdate()
where settlement_date = :settlement_date
  and cp_corp_no = :cp_corp_no
  and use_yn = 'Y'
  and del_yn = 'N';

-- [RawCpConfirmCancel]
delete from cp_accounts_end_info
where settlement_date = :settlement_date
	and settlement_date = :settlement_date
;

  -- [RawCpConfirmCancel___]
update accounting_rawdata set
    cp_confirm_yn = 'N'
  , update_user_no = :oper_user_no
  , update_date = sysdate()
where sp_cor_accounting_date = :settlement_date
  and movie_no in (select 
  movie_no 
from movie 
where cp_corp_no = :cp_corp_no
  and use_yn  ='Y'
  and del_yn = 'N');
