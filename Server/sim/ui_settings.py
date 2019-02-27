"""Deze module definieert de waarden van configuratieparameters voor de UI, bv. van directory-locaties.
Deze waarden worden vervolgens gebruikt om vast te leggen in het configuratie-object (zie :func:`sim.run.Config`).
"""

from settings import *
from datetime import datetime

locatie_keytable = 'DG_I_O_40ANA_INT.{}_KEYTABLE'.format(username)
locatie_abt = 'DG_I_O_40ANA_INT.{}_ABT'.format(username)
locatie_output_abtcode = personal_user_folder_sim+'abtcode/'
locatie_selectieroot = personal_user_folder_sim+'selectiefiles/'
# locatie_folder_export_datadictionary = personal_user_folder_sim+'datadictionaries/'

defaultkey = ['finr', 'peildatum']
default_peildatum = str(datetime.now()).split(" ")[0].replace("-", "").replace(":", "")

definitie_npbelastingplichtig = """create multiset table {keytabel} as (
    select 
    finr, 
    CAST('{peildatumyyyymmdd}' AS DATE format 'yyyymmdd') as peildatum 
    FROM DG_I_P_30INF_CLC.i_clc_lc_np
    WHERE (bvrd_dlg_doelgroep_bes NE 'MINDERJARIG KIND ZONDER OB/LH' OR bvrd_dlg_doelgroep_bes IS NULL)
    AND peildatum >= clc_np_lc_ingang_d
    AND peildatum < clc_np_lc_verval_d
    AND bvr_pso_ovl_d is null or bvr_pso_ovl_d > peildatum)
    WITH DATA PRIMARY INDEX(finr, peildatum)"""

definitie_nnpactief = """create multiset table {keytabel} as (
    select 
    finr, 
    CAST('{peildatumyyyymmdd}' AS DATE format 'yyyymmdd') as peildatum 
    FROM DG_I_P_30INF_CLC.i_clc_lc_nnp
    WHERE 
        peildatum >= clc_nnp_lc_ingang_d
    AND peildatum < clc_nnp_lc_verval_d
    )
    WITH DATA PRIMARY INDEX(finr, peildatum)"""
